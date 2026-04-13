"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, AlertTriangle, Package, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InventoryItem {
  id: string
  name: string
  category: string
  sku: string
  quantity: number
  minStock: number
  price: number
  supplier: string
}

const initialInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Shampoo - Professional",
    category: "Hair Products",
    sku: "HP-001",
    quantity: 3,
    minStock: 5,
    price: 450,
    supplier: "Beauty Wholesale Co.",
  },
  {
    id: "2",
    name: "Conditioner - Premium",
    category: "Hair Products",
    sku: "HP-002",
    quantity: 8,
    minStock: 5,
    price: 380,
    supplier: "Beauty Wholesale Co.",
  },
  {
    id: "3",
    name: "Hair Color - Black",
    category: "Hair Products",
    sku: "HP-003",
    quantity: 12,
    minStock: 10,
    price: 250,
    supplier: "Color Pro Supplies",
  },
  {
    id: "4",
    name: "Facial Cream - Anti-aging",
    category: "Skin Products",
    sku: "SP-001",
    quantity: 6,
    minStock: 3,
    price: 850,
    supplier: "Skin Care International",
  },
  {
    id: "5",
    name: "Nail Polish Set",
    category: "Nail Products",
    sku: "NP-001",
    quantity: 2,
    minStock: 5,
    price: 180,
    supplier: "Nail Art Supplies",
  },
  {
    id: "6",
    name: "Threading Thread",
    category: "Grooming",
    sku: "GR-001",
    quantity: 20,
    minStock: 10,
    price: 50,
    supplier: "Beauty Essentials",
  },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    sku: "",
    quantity: "",
    minStock: "",
    price: "",
    supplier: "",
  })

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddItem = () => {
    if (newItem.name && newItem.category && newItem.quantity) {
      setInventory([
        ...inventory,
        {
          id: Date.now().toString(),
          name: newItem.name,
          category: newItem.category,
          sku: newItem.sku || `SKU-${Date.now()}`,
          quantity: parseInt(newItem.quantity),
          minStock: parseInt(newItem.minStock) || 5,
          price: parseFloat(newItem.price) || 0,
          supplier: newItem.supplier,
        },
      ])
      setNewItem({
        name: "",
        category: "",
        sku: "",
        quantity: "",
        minStock: "",
        price: "",
        supplier: "",
      })
      setIsDialogOpen(false)
    }
  }

  const lowStockCount = inventory.filter((item) => item.quantity <= item.minStock).length
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Track products and supplies</p>
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
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hair Products">Hair Products</SelectItem>
                      <SelectItem value="Skin Products">Skin Products</SelectItem>
                      <SelectItem value="Nail Products">Nail Products</SelectItem>
                      <SelectItem value="Grooming">Grooming</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SKU</Label>
                    <Input
                      value={newItem.sku}
                      onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                      placeholder="SKU-001"
                    />
                  </div>
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Min Stock Level</Label>
                    <Input
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
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
            <p className="text-2xl font-semibold text-foreground">
              ₹{totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.quantity <= item.minStock && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-secondary rounded-md text-sm">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        item.quantity <= item.minStock ? "text-amber-600" : ""
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">
                      (min: {item.minStock})
                    </span>
                  </TableCell>
                  <TableCell>₹{item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Update Stock</DropdownMenuItem>
                        <DropdownMenuItem>Order More</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
