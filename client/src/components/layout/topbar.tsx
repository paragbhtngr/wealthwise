import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { useState } from "react";
import AddTransactionModal from "@/components/modals/add-transaction-modal";

interface TopbarProps {
  title: string;
  selectedAccountId: string;
}

export default function Topbar({ title, selectedAccountId }: TopbarProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 ml-12 lg:ml-0" data-testid="page-title">{title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white hover:bg-blue-700"
              data-testid="button-add-transaction"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="text-gray-600 w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <AddTransactionModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        selectedAccountId={selectedAccountId}
      />
    </>
  );
}
