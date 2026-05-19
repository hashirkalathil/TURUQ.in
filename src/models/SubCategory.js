// src/models/SubCategory.js

import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Parent ID is required for sub-categories'],
        index: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    description: String,
}, {
    collection: 'subcategories',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export default mongoose.models.SubCategory || mongoose.model('SubCategory', subCategorySchema);