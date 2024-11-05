import NhaSanXuatModel from "../../models/nhaCungCap.model.js"
// Get Supplier Information By Id
// [GET] /api/supplier/:id
export async function getSupplierById(req, res) {
    // Get supplier id from request params
    const supplierId = req.params.id;
    const supplier = await NhaSanXuatModel.findById(supplierId);
    
    if (supplier) {
        return res.json(supplier);
    } else {
        return res.status(404).json({ error: 'Supplier not found' });
    }
}