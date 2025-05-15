"use client";

import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {Accordion, AccordionItem} from "@heroui/react";
import MainContent from "./MainContents";

// Updated API_URL configuration with debugging
const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001/api"
    : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
    : "/api";

console.log("Current API_URL:", API_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

export const SearchIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 16.7467 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [duas, setDuas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingSubcategories, setLoadingSubcategories] = useState(null);
  const [loadingDuas, setLoadingDuas] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [selectedDua, setSelectedDua] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories from:", `${API_URL}/categories`);

        // Add timeout to the axios request
        const res = await axios.get(`${API_URL}/categories`, {
          timeout: 10000, // 10 seconds timeout
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log("Categories response:", res.data);

        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          throw new Error("Invalid response format for categories");
        }
      } catch (err) {
        console.error("Full error object:", err);

        // More detailed error handling
        if (err.code === "ECONNABORTED") {
          setError("Request timeout - server did not respond in time");
        } else if (err.code === "ERR_NETWORK") {
          setError(
            "Network error - cannot connect to server. Make sure your backend is running on port 3001"
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load categories"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (categoryId) => {
    if (subcategories[categoryId]) return;

    setLoadingSubcategories(categoryId);

    try {
      console.log(`Fetching subcategories for category ${categoryId}`);
      const res = await axios.get(
        `${API_URL}/categories/${categoryId}/subcategories`
      );

      console.log(`Subcategories response for ${categoryId}:`, res.data);

      if (Array.isArray(res.data)) {
        setSubcategories((prev) => ({...prev, [categoryId]: res.data}));
      } else {
        console.error("Invalid subcategory data format:", res.data);
      }
    } catch (err) {
      console.error(`Failed to load subcategories for ${categoryId}:`, err);
    } finally {
      setLoadingSubcategories(null);
    }
  };

  const handleSubcategoryClick = async (subcategoryId) => {
    if (expandedSubcategory === subcategoryId) {
      setExpandedSubcategory(null); // Collapse if already selected
      return;
    }

    // If already fetched, just expand
    if (duas[subcategoryId]) {
      setExpandedSubcategory(subcategoryId);
      return;
    }

    setLoadingDuas(subcategoryId);
    setExpandedSubcategory(subcategoryId);

    try {
      const res = await axios.get(
        `${API_URL}/subcategories/${subcategoryId}/duas`
      );
      console.log(`Duas response for ${subcategoryId}:`, res.data);

      if (Array.isArray(res.data)) {
        setDuas((prev) => ({...prev, [subcategoryId]: res.data}));
      } else {
        console.error("Invalid duas data format:", res.data);
      }
    } catch (err) {
      console.error(`Failed to load duas for ${subcategoryId}:`, err);
    } finally {
      setLoadingDuas(null);
    }
  };

  const handleDuaClick = (dua) => {
    setSelectedDua(dua);
  };

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    const debounce = setTimeout(() => {
      setIsSearching(true);
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      console.log(`Searching for: "${query}"`);
      const res = await axios.get(
        `${API_URL}/duas/search?q=${encodeURIComponent(query)}`
      );

      console.log("Search results:", res.data);

      if (Array.isArray(res.data)) {
        setSearchResults(res.data);
        return;
      }
    } catch (apiErr) {
      console.log("Search API error:", apiErr);
      console.log("Falling back to client-side search");

      // Only do client-side search if we actually have duas loaded
      const allDuasLoaded = Object.keys(duas).length > 0;

      if (!allDuasLoaded) {
        console.log("No duas loaded for client-side search");
        setSearchResults([]);
        setLoading(false);
        return;
      }
    }

    // Client-side search fallback
    const results = [];

    Object.values(duas).forEach((duasList) => {
      const matches = duasList.filter((dua) =>
        dua?.name_en?.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...matches);
    });

    console.log("Client-side search results:", results);
    setSearchResults(results);
    setLoading(false);
  };

  if (loading && !isSearching) {
    return <p className="p-4">Loading categories...</p>;
  }

  if (error && !isSearching) {
    return <p className="p-4 text-red-600">Error: {error}</p>;
  }

  return (
    <div className="flex min-h-screen bg-[#fafcfa]">
      <div className="w-full md:w-80 lg:w-96 border-r border-[#e7efe4] overflow-y-auto">
        <div className="p-4">
          <div className="mb-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search duas..."
              className="w-full px-4 py-2 pl-10 rounded-lg border border-[#e7efe4] focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent bg-white shadow-sm"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon className="w-5 h-5" />
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {isSearching ? (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Search Results</h3>
              {loading ? (
                <p className="text-sm text-gray-500">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-gray-500">No results found.</p>
              ) : (
                <ul className="space-y-2">
                  {searchResults.map((dua) => (
                    <li
                      key={dua.id}
                      className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedDua(dua)}
                    >
                      {dua.name_en}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <Accordion type="multiple">
              {categories.map((category) => (
                <AccordionItem
                  key={category.id}
                  title={category.name_en}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {loadingSubcategories === category.id ? (
                    <p className="text-sm text-gray-500 p-2">
                      Loading subcategories...
                    </p>
                  ) : (
                    <div className="space-y-1 p-1">
                      {(subcategories[category.id] || []).map((sub) => (
                        <div key={sub.id} className="mb-2">
                          <div
                            className={`flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded ${
                              expandedSubcategory === sub.id
                                ? "bg-gray-100"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubcategoryClick(sub.id);
                            }}
                          >
                            <span className="font-medium text-gray-700">
                              {sub.name_en}
                            </span>
                            {expandedSubcategory === sub.id ? (
                              <span className="text-gray-500 text-xs">▼</span>
                            ) : (
                              <span className="text-gray-500 text-xs"></span>
                            )}
                          </div>

                          {expandedSubcategory === sub.id && (
                            <div className="ml-4 mt-1 border-l-2 border-gray-200">
                              {loadingDuas === sub.id ? (
                                <p className="text-sm text-gray-500 p-2">
                                  Loading duas...
                                </p>
                              ) : duas[sub.id] && duas[sub.id].length > 0 ? (
                                <div className="space-y-1">
                                  {duas[sub.id].map((dua) => (
                                    <div
                                      key={dua.id}
                                      className={`p-2 pl-4 cursor-pointer hover:bg-gray-50 ${
                                        selectedDua?.id === dua.id
                                          ? "bg-green-50 border-l-2 border-teal-700"
                                          : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDuaClick(dua);
                                      }}
                                    >
                                      {dua.name_en}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 p-2">
                                  No duas found
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <MainContent
          selectedDua={selectedDua}
          expandedSubcategory={expandedSubcategory}
          duas={duas}
          loadingDuas={loadingDuas}
        />
      </div>
    </div>
  );
}
