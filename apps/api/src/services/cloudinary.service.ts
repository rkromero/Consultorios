import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isConfigured = () =>
    !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

export async function uploadImage(
    base64DataUrl: string,
    folder: string
): Promise<string> {
    if (!isConfigured()) {
        throw new Error('Cloudinary no está configurado. Agregá CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.');
    }

    const maxBytes = 2 * 1024 * 1024;
    if (base64DataUrl.length > maxBytes * 1.37) {
        throw new Error('La imagen es demasiado grande. Máximo 2MB.');
    }

    const result = await cloudinary.uploader.upload(base64DataUrl, {
        folder: `turnio/${folder}`,
        resource_type: 'image',
        transformation: [
            { width: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
        ],
    });

    return result.secure_url;
}

export async function deleteImage(url: string): Promise<void> {
    if (!isConfigured() || !url) return;

    try {
        const parts = url.split('/');
        const uploadIdx = parts.indexOf('upload');
        if (uploadIdx === -1) return;

        const publicIdWithExt = parts.slice(uploadIdx + 2).join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

        await cloudinary.uploader.destroy(publicId);
    } catch {
        // Non-critical: image may already be deleted
    }
}
