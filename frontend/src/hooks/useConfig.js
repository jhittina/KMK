import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoryService,
  itemService,
  expenseService,
} from "../services/configService";

// Category Hooks
export const useCategories = (params) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryService.getAll(params),
    staleTime: 15 * 60 * 1000, // 15 minutes - categories rarely change
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    onSuccess: (_, variables) => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["categories"] });
      queryClient.refetchQueries({ queryKey: ["category", variables.id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["categories"] });
      queryClient.refetchQueries({ queryKey: ["category"] });
    },
  });
};

export const useAddSubcategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.addSubcategory(id, data),
    onSuccess: (_, variables) => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["categories"] });
      queryClient.refetchQueries({ queryKey: ["category", variables.id] });
    },
  });
};

// Item Hooks
export const useItems = (params) => {
  return useQuery({
    queryKey: ["items", params],
    queryFn: () => itemService.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - items change less frequently
    gcTime: 20 * 60 * 1000, // 20 minutes cache
  });
};

export const useItem = (id) => {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => itemService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes cache
  });
};

export const useItemsByCategory = (category, params) => {
  return useQuery({
    queryKey: ["items", "category", category, params],
    queryFn: () => itemService.getByCategory(category, params),
    enabled: !!category,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes cache
  });
};

export const useItemCategories = () => {
  return useQuery({
    queryKey: ["item-categories"],
    queryFn: itemService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes - categories very stable
    gcTime: 60 * 60 * 1000, // 1 hour cache
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemService.create,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["items"] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => itemService.update(id, data),
    onSuccess: (_, variables) => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["items"] });
      queryClient.refetchQueries({ queryKey: ["item", variables.id] });
      queryClient.refetchQueries({ queryKey: ["item-categories"] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemService.delete,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["items"] });
      queryClient.refetchQueries({ queryKey: ["item"] });
      queryClient.refetchQueries({ queryKey: ["item-categories"] });
    },
  });
};

// Expense Hooks
export const useExpenses = (params) => {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => expenseService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes - expenses change more frequently
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  });
};

export const useExpense = (id) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => expenseService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  });
};

export const useExpenseSummary = (params) => {
  return useQuery({
    queryKey: ["expense-summary", params],
    queryFn: () => expenseService.getSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["expenses"] });
      queryClient.refetchQueries({ queryKey: ["expense-summary"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => expenseService.update(id, data),
    onSuccess: (_, variables) => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["expenses"] });
      queryClient.refetchQueries({ queryKey: ["expense", variables.id] });
      queryClient.refetchQueries({ queryKey: ["expense-summary"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["expenses"] });
      queryClient.refetchQueries({ queryKey: ["expense"] });
      queryClient.refetchQueries({ queryKey: ["expense-summary"] });
    },
  });
};

export const useMarkExpenseAsPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseService.markAsPaid,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["expenses"] });
      queryClient.refetchQueries({ queryKey: ["expense"] });
      queryClient.refetchQueries({ queryKey: ["expense-summary"] });
    },
  });
};

export const useRecordExpensePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }) => expenseService.recordPayment(id, amount),
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["expenses"] });
      queryClient.refetchQueries({ queryKey: ["expense"] });
      queryClient.refetchQueries({ queryKey: ["expense-summary"] });
    },
  });
};

export const useToggleExpenseActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseService.toggleActive,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["expenses"] });
      queryClient.refetchQueries({ queryKey: ["expense"] });
      queryClient.refetchQueries({ queryKey: ["expense-summary"] });
    },
  });
};
