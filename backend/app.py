from fastapi import FastAPI, UploadFile, File
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
import numpy as np
from PIL import Image, ImageFilter
import io
import cv2
from skimage import filters
from skimage.color import rgb2gray
import scipy.stats

app = FastAPI()

# ✅ Load models only once (cache in memory)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print("Using device:", device)

mtcnn = MTCNN(image_size=160, margin=0, device=device)
resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# ✅ Enhanced embedding function with better error handling
def get_embedding_from_bytes(img_bytes):
    try:
        # Validate image data
        if not img_bytes or len(img_bytes) < 100:
            print("Warning: Invalid or empty image data")
            return None

        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Basic image validation
        if img.size[0] < 50 or img.size[1] < 50:
            print("Warning: Image too small for face detection")
            return None

        # Detect faces
        face = mtcnn(img)

        if face is None:
            print("Warning: No face detected in image")
            return None

        # Check if face detection returned valid data
        if face.shape[0] == 0:
            print("Warning: Face detection returned empty result")
            return None

        # Move to device and extract embeddings
        face = face.to(device)
        emb = resnet(face.unsqueeze(0))

        # Validate embedding result
        if emb is None or emb.shape[0] == 0:
            print("Warning: Failed to extract embeddings")
            return None

        result = emb.detach().cpu().numpy()

        # Final validation
        if result.shape[0] == 0 or np.isnan(result).any():
            print("Warning: Invalid embedding data")
            return None

        print(f"✅ Successfully extracted embeddings: shape {result.shape}")
        return result

    except Exception as e:
        print(f"❌ Error in face embedding extraction: {str(e)}")
        return None


# ✅ Cosine similarity
def cosine_similarity(vec1, vec2):
    v1, v2 = vec1.flatten(), vec2.flatten()
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))


# ✅ Enhanced API: Compare face embeddings directly
@app.post("/compare-embeddings/")
async def compare_embeddings(data: dict):
    try:
        # Validate input
        if not data or 'embeddings1' not in data or 'embeddings2' not in data:
            return {
                "success": False,
                "error": "Missing embeddings1 or embeddings2 in request body"
            }

        embeddings1 = data['embeddings1']
        embeddings2 = data['embeddings2']

        # Validate embeddings format
        if not isinstance(embeddings1, list) or not isinstance(embeddings2, list):
            return {
                "success": False,
                "error": "Embeddings must be arrays/lists"
            }

        if len(embeddings1) != 512 or len(embeddings2) != 512:
            return {
                "success": False,
                "error": f"Embeddings must be 512-dimensional, got {len(embeddings1)} and {len(embeddings2)}"
            }

        # Check for invalid values
        if any(not isinstance(x, (int, float)) or np.isnan(x) or np.isinf(x) for x in embeddings1 + embeddings2):
            return {
                "success": False,
                "error": "Embeddings contain invalid values (NaN, Inf, or non-numeric)"
            }

        # Convert to numpy arrays
        emb1 = np.array(embeddings1).reshape(1, -1)
        emb2 = np.array(embeddings2).reshape(1, -1)

        # Calculate similarity
        similarity = cosine_similarity(emb1, emb2)

        # Validate similarity result
        if np.isnan(similarity) or np.isinf(similarity):
            return {
                "success": False,
                "error": "Failed to calculate similarity"
            }

        match = similarity > 0.6

        print(f"✅ Compared embeddings: similarity = {similarity:.4f}, match = {match}")

        return {
            "success": True,
            "similarity": float(similarity),
            "match": bool(match)
        }

    except Exception as e:
        print(f"❌ Error comparing embeddings: {str(e)}")
        return {
            "success": False,
            "error": f"Comparison failed: {str(e)}"
        }

# Example API: compare 2 images
@app.post("/compare-faces/")
async def compare_faces(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    img1_bytes = await file1.read()
    img2_bytes = await file2.read()

    emb1 = get_embedding_from_bytes(img1_bytes)
    emb2 = get_embedding_from_bytes(img2_bytes)

    if emb1 is None or emb2 is None:
        return {"match": False, "reason": "No face detected"}

    sim = cosine_similarity(emb1, emb2)
    return {
        "similarity": float(sim),
        "match": sim > 0.6
    }

# ✅ Enhanced API: Extract face embeddings from single image
@app.post("/extract-embeddings/")
async def extract_embeddings(file: UploadFile = File(...)):
    try:
        # Validate file
        if not file:
            return {
                "error": "No file provided",
                "embeddings": None,
                "success": False
            }

        # Check file size (max 10MB)
        file_size = 0
        content = await file.read()
        file_size = len(content)

        if file_size > 10 * 1024 * 1024:  # 10MB limit
            return {
                "error": "File too large. Maximum size is 10MB",
                "embeddings": None,
                "success": False
            }

        if file_size < 1000:  # Minimum 1KB
            return {
                "error": "File too small or corrupted",
                "embeddings": None,
                "success": False
            }

        print(f"🔍 Processing image: {file.filename}, Size: {file_size} bytes")

        # Extract embeddings
        emb = get_embedding_from_bytes(content)

        if emb is None:
            return {
                "error": "No valid face detected in the image. Please ensure the image contains a clear, well-lit face.",
                "embeddings": None,
                "success": False,
                "tips": [
                    "Ensure the face is clearly visible",
                    "Use good lighting",
                    "Avoid blurry images",
                    "Face should be upright and centered"
                ]
            }

        # Convert numpy array to list for JSON serialization
        embeddings_list = emb.flatten().tolist()

        # Validate final result
        if not embeddings_list or len(embeddings_list) != 512:
            return {
                "error": "Failed to generate valid face embeddings",
                "embeddings": None,
                "success": False
            }

        print(f"✅ Successfully processed {file.filename}: {len(embeddings_list)} dimensions")

        return {
            "embeddings": embeddings_list,
            "dimensions": len(embeddings_list),
            "success": True,
            "file_info": {
                "filename": file.filename,
                "size": file_size,
                "processed_at": "2025-09-21"
            }
        }

    except Exception as e:
        print(f"❌ Processing error for {file.filename if file else 'unknown'}: {str(e)}")
        return {
            "error": f"Image processing failed: {str(e)}",
            "embeddings": None,
            "success": False
        }

# ✅ Health check endpoint
@app.get("/health/")
async def health_check():
    return {
        "status": "healthy",
        "service": "Face Recognition API",
        "device": str(device),
        "models_loaded": {
            "mtcnn": mtcnn is not None,
            "resnet": resnet is not None
        },
        "timestamp": "2025-09-21"
    }

# ✅ Model info endpoint
@app.get("/info/")
async def model_info():
    return {
        "face_detection": {
            "model": "MTCNN",
            "image_size": 160,
            "margin": 0
        },
        "face_recognition": {
            "model": "InceptionResnetV1",
            "pretrained": "vggface2",
            "embedding_dimensions": 512
        },
        "device": str(device),
        "gpu_available": torch.cuda.is_available(),
        "pytorch_version": torch.__version__
    }
