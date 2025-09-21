# Start Python Face Recognition Server
echo "Starting Python face recognition server..."
cd backend
python server.py

# In another terminal, you can test the API:
# curl -X POST "http://localhost:8000/extract-embeddings/" -F "file=@test_image.jpg"