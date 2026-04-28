import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  packageService,
  bookingService,
  customerService,
} from "../services/workspaceService";

// Package Hooks
export const usePackages = (params) => {
  return useQuery({
    queryKey: ["packages", params],
    queryFn: () => packageService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const usePackage = (id) => {
  return useQuery({
    queryKey: ["package", id],
    queryFn: () => packageService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: packageService.create,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["packages"] });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => packageService.update(id, data),
    onSuccess: (_, variables) => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["packages"] });
      queryClient.refetchQueries({ queryKey: ["package", variables.id] });
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: packageService.delete,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["packages"] });
      queryClient.refetchQueries({ queryKey: ["package"] });
    },
  });
};

// Use query for package calculation since it's deterministic (same input = same output)
export const useCalculatePackage = (params, options = {}) => {
  return useQuery({
    queryKey: ["calculate-package", params],
    queryFn: () => packageService.calculate(params),
    enabled: !!(params?.itemDetails && params?.guestCount),
    staleTime: 30 * 60 * 1000, // 30 minutes - calculations don't change
    gcTime: 60 * 60 * 1000, // 1 hour cache
    ...options,
  });
};

// Booking Hooks
export const useBookings = (params) => {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => bookingService.getAll(params),
    staleTime: 3 * 60 * 1000, // 3 minutes - bookings update more frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const useBooking = (id) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
    staleTime: 0, // Always consider stale for immediate refetch
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["bookings"] });
      queryClient.refetchQueries({ queryKey: ["customers"] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => bookingService.update(id, data),
    onSuccess: (response, variables) => {
      // Update the cache immediately with the response
      if (response?.data) {
        queryClient.setQueryData(["booking", variables.id], response);
      }

      // Also invalidate to trigger refetch in other components
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => bookingService.updateStatus(id, status),
    onSuccess: (response, variables) => {
      // Update the cache immediately with the response
      if (response?.data) {
        queryClient.setQueryData(["booking", variables.id], response);
      }

      // Also invalidate to trigger refetch in other components
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
  });
};

export const useRecordBookingPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...paymentData }) =>
      bookingService.recordPayment(id, paymentData),
    onSuccess: (response, variables) => {
      // Update the cache immediately with the response
      if (response?.data) {
        queryClient.setQueryData(["booking", variables.id], response);
      }

      // Also invalidate to trigger refetch in other components
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingService.delete,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["bookings"] });
      queryClient.refetchQueries({ queryKey: ["booking"] });
    },
  });
};

// Use query for booking calculation to enable caching
export const useCalculateBooking = (params, options = {}) => {
  return useQuery({
    queryKey: ["calculate-booking", params],
    queryFn: () => bookingService.calculate(params),
    enabled: !!(
      params?.packageIds &&
      params?.packageIds.length > 0 &&
      params?.guestCount
    ),
    staleTime: 30 * 60 * 1000, // 30 minutes - calculations are deterministic
    gcTime: 60 * 60 * 1000, // 1 hour cache
    ...options,
  });
};

// Customer Hooks
export const useCustomers = (params) => {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customerService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const useCustomer = (id) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => customerService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const useCustomerStats = (id) => {
  return useQuery({
    queryKey: ["customer-stats", id],
    queryFn: () => customerService.getStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

export const useSearchCustomers = (query) => {
  return useQuery({
    queryKey: ["customers", "search", query],
    queryFn: () => customerService.search(query),
    staleTime: 10 * 60 * 1000, // 10 minutes - search results stable
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    enabled: query && query.length >= 2,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["customers"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: (_, variables) => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["customers"] });
      queryClient.refetchQueries({ queryKey: ["customer", variables.id] });
      queryClient.refetchQueries({
        queryKey: ["customer-stats", variables.id],
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      // Force immediate refetch of active queries
      queryClient.refetchQueries({ queryKey: ["customers"] });
      queryClient.refetchQueries({ queryKey: ["customer"] });
      queryClient.refetchQueries({ queryKey: ["customer-stats"] });
    },
  });
};
