import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, Book } from "lucide-react";
import Topbar from "@/components/layout/topbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { GlossaryTerm, InsertGlossaryTerm } from "@shared/schema";

export default function Glossary() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [formData, setFormData] = useState({
    term: "",
    definition: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: glossaryTerms = [], isLoading } = useQuery<GlossaryTerm[]>({
    queryKey: ["/api/glossary"],
  });

  const createTermMutation = useMutation({
    mutationFn: async (data: InsertGlossaryTerm) => {
      const response = await apiRequest("POST", "/api/glossary", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      toast({
        title: "Success",
        description: "Glossary term created successfully",
      });
      closeModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create glossary term",
        variant: "destructive",
      });
    },
  });

  const updateTermMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertGlossaryTerm> }) => {
      const response = await apiRequest("PUT", `/api/glossary/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      toast({
        title: "Success",
        description: "Glossary term updated successfully",
      });
      closeModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update glossary term",
        variant: "destructive",
      });
    },
  });

  const deleteTermMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/glossary/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      toast({
        title: "Success",
        description: "Glossary term deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete glossary term",
        variant: "destructive",
      });
    },
  });

  // Filter terms based on search
  const filteredTerms = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      term: "",
      definition: "",
    });
    setEditingTerm(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (term: GlossaryTerm) => {
    setFormData({
      term: term.term,
      definition: term.definition,
    });
    setEditingTerm(term);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.term.trim() || !formData.definition.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both term and definition",
        variant: "destructive",
      });
      return;
    }

    const termData: InsertGlossaryTerm = {
      term: formData.term.trim(),
      definition: formData.definition.trim(),
    };

    if (editingTerm) {
      updateTermMutation.mutate({ id: editingTerm.id, data: termData });
    } else {
      createTermMutation.mutate(termData);
    }
  };

  const handleDeleteTerm = (term: GlossaryTerm) => {
    if (window.confirm(`Are you sure you want to delete "${term.term}"?`)) {
      deleteTermMutation.mutate(term.id);
    }
  };

  // Group terms alphabetically
  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const sortedLetters = Object.keys(groupedTerms).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="Glossary" selectedAccountId={selectedAccountId} />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Finance Glossary</h2>
              <p className="text-gray-600">Learn key financial terms and concepts</p>
            </div>
            <Button 
              onClick={openAddModal}
              className="bg-primary hover:bg-blue-700"
              data-testid="button-add-term"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Term
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search financial terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
              data-testid="input-search-terms"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-8">Loading glossary...</div>
          ) : filteredTerms.length === 0 ? (
            <div className="text-center py-12">
              <Book className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No terms found matching your search" : "No glossary terms available"}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {searchTerm ? "Try a different search term" : "Add your first financial term to get started"}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal} className="bg-primary hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Term
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {sortedLetters.map((letter) => (
                <div key={letter}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    {letter}
                  </h3>
                  <div className="grid gap-4">
                    {groupedTerms[letter].map((term) => (
                      <Card 
                        key={term.id} 
                        className="hover:shadow-md transition-shadow"
                        data-testid={`term-${term.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg text-primary">
                              {term.term}
                            </CardTitle>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditModal(term)}
                                data-testid={`button-edit-term-${term.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteTerm(term)}
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-delete-term-${term.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-700 leading-relaxed">
                            {term.definition}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        {filteredTerms.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-8 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{glossaryTerms.length}</p>
                    <p className="text-sm text-gray-600">Total Terms</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{sortedLetters.length}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{filteredTerms.length}</p>
                    <p className="text-sm text-gray-600">
                      {searchTerm ? "Matching" : "Showing"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add/Edit Term Modal */}
      <Dialog open={showAddModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl" data-testid="modal-glossary-term">
          <DialogHeader>
            <DialogTitle>{editingTerm ? "Edit Term" : "Add Glossary Term"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                type="text"
                required
                placeholder="Enter financial term"
                value={formData.term}
                onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
                data-testid="input-term"
              />
            </div>

            <div>
              <Label htmlFor="definition">Definition</Label>
              <Textarea
                id="definition"
                required
                placeholder="Enter the definition of this financial term"
                value={formData.definition}
                onChange={(e) => setFormData(prev => ({ ...prev, definition: e.target.value }))}
                className="min-h-32"
                data-testid="textarea-definition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a clear, concise explanation that would be helpful for someone learning about personal finance.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-blue-700"
                disabled={createTermMutation.isPending || updateTermMutation.isPending}
                data-testid="button-submit-term"
              >
                {(createTermMutation.isPending || updateTermMutation.isPending) 
                  ? (editingTerm ? "Updating..." : "Creating...") 
                  : (editingTerm ? "Update Term" : "Add Term")
                }
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={closeModal}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
