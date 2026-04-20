"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, AlertTriangle, Package, MoreHorizontal, ArrowUpDown, Eye, Pencil, Trash2, Calendar, Globe, Zap, UserCheck, Receipt } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/api/inventory/inventory"

interface InventoryItem {
  id: string
  name: string
  category: string
  stockQty: number
  minStockLevel: number
  unitPrice: number
  supplier: string
  expiryDate: string
}

const emptyForm = {
  name: "",
  category: "",
  stockQty: "",
  minStockLevel: "",
  unitPrice: "",
  supplier: "",
  expiryDate: "",
}

const STOCK_SORT_OPTIONS = [
  { value: "none", label: "All Stock" },
  { value: "desc", label: "High to Low" },
  { value: "asc", label: "Low to High" },
]
const PAGE_SIZE = 10

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stockSort, setStockSort] = useState("none")
  const [currentPage, setCurrentPage] = useState(1)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState(emptyForm)

  const [viewItem, setViewItem] = useState<InventoryItem | null>(null)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null)

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getInventory({
        name: search || undefined,
        sortStock: stockSort !== "none" ? (stockSort as 'asc' | 'desc') : undefined,
        limit: 100,
      })
      const list: InventoryItem[] = res?.data ?? res ?? []
      setInventory(list)
    } catch (err) {
      console.error("Failed to fetch inventory", err)
    } finally {
      setLoading(false)
    }
  }, [search, stockSort])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, stockSort])

  const totalPages = Math.max(1, Math.ceil(inventory.length / PAGE_SIZE))
  const paginatedInventory = inventory.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.stockQty) return
    try {
      await createInventoryItem({
        name: newItem.name,
        category: newItem.category,
        stockQty: parseInt(newItem.stockQty),
        minStockLevel: parseInt(newItem.minStockLevel) || 5,
        unitPrice: parseFloat(newItem.unitPrice) || 0,
        supplier: newItem.supplier,
        expiryDate: newItem.expiryDate,
      })
      setNewItem(emptyForm)
      setIsDialogOpen(false)
      fetchInventory()
    } catch (err) {
      console.error("Failed to create inventory item", err)
    }
  }

  const handleEditSave = async () => {
    if (!editItem) return
    try {
      await updateInventoryItem(editItem.id, {
        name: editItem.name,
        stockQty: editItem.stockQty,
        minStockLevel: editItem.minStockLevel,
        unitPrice: editItem.unitPrice,
        supplier: editItem.supplier,
        expiryDate: editItem.expiryDate,
      })
      setEditItem(null)
      fetchInventory()
    } catch (err) {
      console.error("Failed to update inventory item", err)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      await deleteInventoryItem(deleteItem.id)
      setDeleteItem(null)
      fetchInventory()
    } catch (err) {
      console.error("Failed to delete inventory item", err)
    }
  }

  const lowStockCount = inventory.filter((item) => item.stockQty <= item.minStockLevel).length
  const totalItems = inventory.reduce((sum, item) => sum + item.stockQty, 0)
  const totalValue = inventory.reduce((sum, item) => sum + item.stockQty * item.unitPrice, 0)

  return (
    <>
      <div className="premium-page p-4 sm:p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase mb-1">Stock</p>
            <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track products and supplies</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Product Name</Label>
                  <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Enter product name" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="Hair Products">Hair Products</SelectItem>
                      <SelectItem className="cursor-pointer" value="Skin Products">Skin Products</SelectItem>
                      <SelectItem className="cursor-pointer" value="Nail Products">Nail Products</SelectItem>
                      <SelectItem className="cursor-pointer" value="Grooming">Grooming</SelectItem>
                      <SelectItem className="cursor-pointer" value="Equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price (৳)</Label><Input type="number" value={newItem.unitPrice} onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })} placeholder="0" /></div>
                  <div><Label>Expiry Date</Label><Input type="date" value={newItem.expiryDate} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Quantity</Label><Input type="number" value={newItem.stockQty} onChange={(e) => setNewItem({ ...newItem, stockQty: e.target.value })} placeholder="0" /></div>
                  <div><Label>Min Stock Level</Label><Input type="number" value={newItem.minStockLevel} onChange={(e) => setNewItem({ ...newItem, minStockLevel: e.target.value })} placeholder="5" /></div>
                </div>
                <div><Label>Supplier</Label><Input value={newItem.supplier} onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })} placeholder="Enter supplier name" /></div>
                <Button onClick={handleAddItem} className="w-full">Add Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-semibold text-foreground">{totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-semibold text-foreground">{inventory.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-semibold text-foreground">{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-semibold text-foreground">৳{totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>

              <Select value={stockSort} onValueChange={setStockSort}>
                <SelectTrigger className="w-36 cursor-pointer">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STOCK_SORT_OPTIONS.map(opt => (
                    <SelectItem className="cursor-pointer" key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground ml-auto">{inventory.length} results</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-primary/60" />Product</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-primary/60" />Category</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/60" />Quantity</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-primary/60" />Price</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-primary/60" />Supplier</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" />Expiry</span></TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading...</TableCell>
                  </TableRow>
                ) : inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No items found</TableCell>
                  </TableRow>
                ) : paginatedInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.stockQty <= item.minStockLevel && (<AlertTriangle className="w-4 h-4 text-amber-500" />)}
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="px-2 py-1 bg-secondary rounded-md text-sm">{item.category}</span></TableCell>
                    <TableCell>
                      <span className={`font-medium ${item.stockQty <= item.minStockLevel ? "text-amber-600" : ""}`}>{item.stockQty}</span>
                      <span className="text-muted-foreground text-xs ml-1">(min: {item.minStockLevel})</span>
                    </TableCell>
                    <TableCell>৳{Number(item.unitPrice).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setViewItem(item)}><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setEditItem({ ...item })}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteItem(item)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!loading && inventory.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, inventory.length)} of {inventory.length} entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Inventory Item Details</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{viewItem.name}</p></div>
                <div><Label className="text-muted-foreground">Category</Label><p className="font-medium">{viewItem.category}</p></div>
                <div><Label className="text-muted-foreground">Quantity</Label><p className="font-medium">{viewItem.stockQty} (min: {viewItem.minStockLevel})</p></div>
                <div><Label className="text-muted-foreground">Price</Label><p className="font-medium">৳{Number(viewItem.unitPrice).toLocaleString()}</p></div>
                <div><Label className="text-muted-foreground">Supplier</Label><p className="font-medium">{viewItem.supplier}</p></div>
                <div><Label className="text-muted-foreground">Expiry Date</Label><p className="font-medium">{viewItem.expiryDate ? new Date(viewItem.expiryDate).toLocaleDateString() : "—"}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Inventory Item</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4 mt-4">
              <div><Label>Name</Label><Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Quantity</Label><Input type="number" value={editItem.stockQty} onChange={(e) => setEditItem({ ...editItem, stockQty: parseInt(e.target.value) || 0 })} /></div>
                <div><Label>Min Stock</Label><Input type="number" value={editItem.minStockLevel} onChange={(e) => setEditItem({ ...editItem, minStockLevel: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price (৳)</Label><Input type="number" value={editItem.unitPrice} onChange={(e) => setEditItem({ ...editItem, unitPrice: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Expiry Date</Label><Input type="date" value={editItem.expiryDate?.toString().split('T')[0] ?? ""} onChange={(e) => setEditItem({ ...editItem, expiryDate: e.target.value })} /></div>
              </div>
              <div><Label>Supplier</Label><Input value={editItem.supplier} onChange={(e) => setEditItem({ ...editItem, supplier: e.target.value })} /></div>
              <Button className="w-full" onClick={handleEditSave}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Item</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleteItem?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
