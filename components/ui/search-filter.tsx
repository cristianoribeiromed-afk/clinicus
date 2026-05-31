"use client";

import { useState, useCallback } from "react";
import { Search, X, Filter, SortAsc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 bg-card border-border"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn("w-full sm:w-[180px] bg-card border-border", className)}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface FilterTabsProps {
  tabs: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({
  tabs,
  value,
  onChange,
  className,
}: FilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className={className}>
      <TabsList className="bg-card border border-border">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

// Combined filter bar component
interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: {
    ciclo?: {
      value: string;
      onChange: (value: string) => void;
      options: FilterOption[];
    };
    tipo?: {
      value: string;
      onChange: (value: string) => void;
      options: FilterOption[];
    };
    sort?: {
      value: string;
      onChange: (value: string) => void;
      options: FilterOption[];
    };
  };
  showSearch?: boolean;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  filterOptions,
  showSearch = true,
  className,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        {showSearch && (
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            className="flex-1"
          />
        )}

        <div className="flex gap-2">
          {filterOptions?.ciclo && (
            <FilterSelect
              label="Ciclo"
              {...filterOptions.ciclo}
              className="flex-1 sm:flex-initial"
            />
          )}

          {filterOptions?.tipo && (
            <FilterSelect
              label="Tipo"
              {...filterOptions.tipo}
              className="flex-1 sm:flex-initial"
            />
          )}

          {filterOptions?.sort && (
            <FilterSelect
              label="Ordenar"
              {...filterOptions.sort}
              className="flex-1 sm:flex-initial"
            />
          )}
        </div>
      </div>
    </div>
  );
}
