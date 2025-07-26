import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import Topbar from "@/components/layout/topbar";
import AddCategoryModal from "@/components/modals/add-category-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";
import { getIcon } from "@/lib/icons";

export default function Categories() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expenseCategories = filteredCategories.filter(cat => cat.type === "expense");
  const incomeCategories = filteredCategories.filter(cat => cat.type === "income");

  const handleDeleteCategory = (category: Category) => {
    if (category.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default categories cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategory.mutate(category.id);
    }
  };

  const CategoryGrid = ({ categories, title }: { categories: Category[], title: string }) => (
    <Card data-testid={`card-${title.toLowerCase()}-categories`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{categories.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon as any);
            
            return (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                data-testid={`category-${category.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {category.type} {category.isDefault && "• Default"}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingCategory(category)}
                    data-testid={`button-edit-category-${category.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!category.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="Categories" selectedAccountId={selectedAccountId} />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
              data-testid="input-search-categories"
            />
          </div>
          
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-blue-700"
            data-testid="button-add-category"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : (
          <div className="space-y-6">
            <CategoryGrid categories={expenseCategories} title="Expense Categories" />
            <CategoryGrid categories={incomeCategories} title="Income Categories" />
          </div>
        )}

        {!isLoading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or add a new category</p>
          </div>
        )}
      </div>

      <AddCategoryModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
