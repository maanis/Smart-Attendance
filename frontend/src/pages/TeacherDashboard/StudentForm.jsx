import { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload, User, Loader2, X } from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const StudentForm = ({ onStudentCreated }) => {
    const [formData, setFormData] = useState({
        name: "",
        roll: "",
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Compress image before upload
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions (max 800px width/height while maintaining aspect ratio)
                const maxSize = 800;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    },
                    'image/jpeg',
                    0.7 // 70% quality
                );
            };

            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Invalid file type", { description: "Please select an image file." });
            return;
        }

        // Validate file size (max 10MB before compression)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File too large", { description: "Please select an image smaller than 10MB." });
            return;
        }

        try {
            // Compress the image
            const compressedFile = await compressImage(file);

            setSelectedImage(compressedFile);
            setImagePreview(URL.createObjectURL(compressedFile));

            toast.success("Image selected", {
                description: `Compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            });
        } catch (error) {
            console.error('Image compression error:', error);
            toast.error("Image processing failed", { description: "Please try again with a different image." });
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim() || !formData.roll.trim()) {
            toast.error("Missing Information", { description: "Please fill in all required fields." });
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('roll', formData.roll.trim().toUpperCase());

            if (selectedImage) {
                submitData.append('image', selectedImage);
            }

            const { data } = await axiosInstance.post('/students', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Student Created Successfully!", {
                description: `${data.student.name} (${data.student.roll}) has been added.`
            });

            // Reset form
            setFormData({ name: "", roll: "" });
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Notify parent component
            if (onStudentCreated) {
                onStudentCreated(data.student);
            }

        } catch (error) {
            console.error("Create student error:", error);

            const errorMessage = error.response?.data?.error || "Failed to create student";
            const errorDetails = error.response?.data?.details || "";

            toast.error(errorMessage, {
                description: errorDetails || "Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Add New Student
                </CardTitle>
                <CardDescription>
                    Create a student profile with optional face recognition
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Enter student's full name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                        />
                    </div>

                    {/* Roll Number Field */}
                    <div className="space-y-2">
                        <Label htmlFor="roll">Roll Number *</Label>
                        <Input
                            id="roll"
                            type="number"
                            placeholder="Enter roll number (e.g., 01)"
                            value={formData.roll}
                            onChange={(e) => handleInputChange('roll', e.target.value.toUpperCase())}
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Profile Image (Optional)</Label>
                        <div className="flex flex-col items-center gap-4">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6"
                                        onClick={removeImage}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            <p className="text-xs text-gray-500 text-center">
                                Upload a clear photo for face recognition
                                <br />
                                Image will be compressed automatically
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            isSubmitting ||
                            !formData.name.trim() ||
                            !formData.roll.trim() ||
                            !selectedImage
                        }
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Student...
                            </>
                        ) : (
                            <>
                                <User className="mr-2 h-4 w-4" />
                                Create Student
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default StudentForm;