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
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteModal } from "@/components/modal/DeleteModal";
import { useSession } from "next-auth/react";

// TypeScript type for API response item
type Experience = {
  _id: string;
  title: string;
  desccription: string; // note: your API has a typo, use "desccription"
  image: { url: string; public_id: string };
  v: number;
};

const ExperienceList: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const session = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.data?.user as any;
  const token = user?.accessToken;

  // Fetch experiences
  const { data, isLoading, isError, refetch } = useQuery<{
    success: boolean;
    message: string;
    data: Experience[];
  }>({
    queryKey: ["experiences"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/experience`
      );
      if (!res.ok) throw new Error("Failed to fetch experiences");
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
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/experience/delete/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete experience");
      toast.success("Experience deleted successfully");
      setDeleteModalOpen(false);
      setSelectedId(null);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete experience");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading experiences...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load experiences. Please refresh.
      </div>
    );
  }

  const experiences = data?.data || [];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-16">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Experiences
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Experiences</span>
          </nav>
        </div>
        <Link href="/dashboard/add-exprences">
          <Button className="bg-cyan-500 text-base hover:bg-cyan-600 text-white px-8 h-[50px] rounded-lg font-semibold shadow-lg flex items-center gap-2">
            <Plus className="!w-7 !h-7" />
            Add Experience
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title & Description</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {experiences.map((exp) => (
            <TableRow key={exp._id}>
              <TableCell className="w-[100px] h-24">
                <div className="relative w-[100px] h-24 rounded-lg overflow-hidden">
                  <Image
                    src={exp.image.url}
                    alt={exp.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>

              <TableCell>
                <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: exp?.desccription }} />
              </TableCell>

              <TableCell className="text-center flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => handleDeleteClick(exp._id)}
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

export default ExperienceList;
