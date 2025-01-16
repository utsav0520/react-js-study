import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from ".."; // Replace with actual import paths for these components
import appwriteService from "../../appwrite/config"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        getValues,
    } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    // const userData = useSelector((state) => state.auth.userData);
    const userData = useSelector((state) => state.auth.userData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState(null);

    const submit = async (data) => {
        if (!userData?.$id) {
            alert("User is not authenticated. Please log in.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (post) {
                // Updating existing post
                const file = data.image?.[0] ? await appwriteService.uploadFile(data.image[0]) : null;

                if (file) {
                    await appwriteService.deleteFile(post.featuredImage);
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: file?.$id,
                });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                }
            } else {
                // Creating new post
                const file = await appwriteService.uploadFile(data.image?.[0]);

                if (file) {
                    const dbPost = await appwriteService.createPost({
                        ...data,
                        featuredImage: file.$id,
                        userId: userData.$id,
                    });

                    if (dbPost) {
                        navigate(`/post/${dbPost.$id}`);
                    }
                }
            }
        } catch (error) {
            console.error("Post submission error:", error);
            alert("An error occurred while processing the post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const slugTransform = useCallback((value) => {
        return value
            ?.trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]+/g, "-")
            .replace(/\s+/g, "-") || "";
    }, []);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    // Image preview
    useEffect(() => {
        if (watch("image")?.[0]) {
            const file = watch("image")[0];
            setPreview(URL.createObjectURL(file));
        }
    }, [watch("image")]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {preview && (
                    <div className="w-full mb-4">
                        <img src={preview} alt="Preview" className="rounded-lg" />
                    </div>
                )}
                {post && !preview && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
