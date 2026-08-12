# Plan - Correcting Size and Price Selection in Orders

Fix the incoherent mixture of product-specific sizes and global sizes in the Order module, ensuring prices correctly follow the selected size variation and are reset properly when switching products.

## Technical Details

### 1. Logic Fixes in `src/features/pedidos/ItensPedidoTable.tsx`

- **Size Selector (`SelectContent`):**
    - Implement the "Fallback Rule": If `produtoSelecionado.variacoesTamanhos` exists and has items, show *only* those.
    - Otherwise, show global `tamanhos` as a fallback.
    - Prevent mixing both lists.
- **Dropdown UI Improvements:**
    - Format items as a flexbox layout: Size on the left, Price on the right (muted color).
    - Remove the "(Preço: ...)" text for a cleaner look.
- **Product Change (`selecionarProduto`):**
    - Reset `tamanho` to `undefined` when a product is changed.
    - Set `valorUnitario` to the new product's `precoBase` (initial state).
    - Clear the `rascunho.valorStr` to match the new `precoBase`.
    - Ensure `valorUnitario` doesn't carry over from the previous product.
- **Size Selection (`onValueChange`):**
    - When a size is selected, find the matching variation in `produtoSelecionado.variacoesTamanhos`.
    - Update both `valorUnitario` and `rascunho.valorStr` with the `precoAVista` of that variation.

### 2. Verification Plan

- **Manual Testing Scenarios:**
    - **Scenario A (Children's Product):** Select a product with numeric sizes (01, 02...). Verify only these appear with their respective prices.
    - **Scenario B (Adult Product):** Select a product with letter sizes (P, M, G...). Verify only these appear.
    - **Scenario C (Mixed Table):** Select a product with a custom sequence (02...16, P...GG). Verify the exact sequence is preserved.
    - **Scenario D (Product Swap):** Select Product A -> choose size -> swap to Product B. Verify size is reset and price updates to Product B's base price.
- **Build Verification:**
    - Run `npm run build` to ensure no regressions or type errors.
