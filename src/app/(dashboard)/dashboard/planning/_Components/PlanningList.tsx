/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight,Trash2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteModal } from "@/components/modal/DeleteModal";
import { useSession } from "next-auth/react";

// TypeScript type for contact
type Contact = {
  _id: string;
  name: string;
  email: string;
  homeBase: string;
  instagram: string;
  description: string;
};

const PlanningList: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const session = useSession();
  const user = session?.data?.user as any;
  const token = user?.accessToken;

  // Fetch contacts
  const { data, isLoading, isError, refetch } = useQuery<{
    success: boolean;
    message: string;
    data: Contact[];
  }>({
    queryKey: ["contact"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contact`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    },
  });

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contact/delete/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete contact");
      toast.success("Contact deleted successfully");
      setDeleteModalOpen(false);
      setSelectedId(null);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete contact");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading contacts...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load contacts. Please refresh.
      </div>
    );
  }

  const contacts = data?.data || [];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-16">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Contacts
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Contacts</span>
          </nav>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Home Base</TableHead>
            <TableHead>Instagram</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact._id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.homeBase}</TableCell>
              <TableCell>{contact.instagram}</TableCell>
              <TableCell>
                <p dangerouslySetInnerHTML={{ __html: contact.description }} />
              </TableCell>
              <TableCell className="text-center flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => handleDeleteClick(contact._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default PlanningList;
