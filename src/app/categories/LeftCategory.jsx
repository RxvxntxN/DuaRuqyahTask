"use client";

import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {Accordion, AccordionItem} from "@heroui/react";
import MainContent from "./MainContents";

const API_URL = "/api/proxy?path=";

export const SearchIcon = (props) => {
  return (
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
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
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
};

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
        const res = await axios.get(`${API_URL}categories`);
        if (res.data && Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          throw new Error("Invalid response format for categories");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load categories"
        );
        console.error("Category loading error:", err);
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
      const res = await axios.get(
        `${API_URL}categories/${categoryId}/subcategories`
      );
      if (res.data && Array.isArray(res.data)) {
        setSubcategories((prev) => ({
          ...prev,
          [categoryId]: res.data,
        }));
      } else {
        console.error("Invalid subcategory data format:", res.data);
      }
    } catch (err) {
      console.error("Failed to load subcategories:", err);
    } finally {
      setLoadingSubcategories(null);
    }
  };

  const handleSubcategoryClick = async (subcategoryId) => {
    if (expandedSubcategory === subcategoryId) {
      setExpandedSubcategory(null);
      return;
    }

    setExpandedSubcategory(subcategoryId);
    if (duas[subcategoryId]) return;

    setLoadingDuas(subcategoryId);

    try {
      const res = await axios.get(
        `${API_URL}subcategories/${subcategoryId}/duas`
      );
      if (res.data && Array.isArray(res.data)) {
        setDuas((prev) => ({
          ...prev,
          [subcategoryId]: res.data,
        }));
      } else {
        console.error("Invalid duas data format:", res.data);
      }
    } catch (err) {
      console.error("Failed to load duas:", err);
    } finally {
      setLoadingDuas(null);
    }
  };

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      setIsSearching(true);
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query || !query.trim()) return;

    setLoading(true);

    try {
      try {
        const res = await axios.get(
          `${API_URL}search?q=${encodeURIComponent(query)}`
        );
        if (res.data && Array.isArray(res.data)) {
          setSearchResults(res.data);
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        console.log(
          "API search not available, using client-side search",
          apiErr
        );
      }

      const results = [];

      if (duas && Object.keys(duas).length > 0) {
        Object.keys(duas).forEach((subcategoryId) => {
          const subcategoryDuas = duas[subcategoryId];

          if (subcategoryDuas && Array.isArray(subcategoryDuas)) {
            const matches = subcategoryDuas.filter(
              (dua) =>
                dua &&
                dua.name_en &&
                typeof dua.name_en === "string" &&
                dua.name_en.toLowerCase().includes(query.toLowerCase())
            );

            if (matches && matches.length > 0) {
              results.push(...matches);
            }
          }
        });
      }

      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
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
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search duas..."
                className="w-full px-4 py-2 pl-10 rounded-lg border border-[#e7efe4] focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent bg-white shadow-sm transition-all duration-200"
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
          </div>
          {isSearching ? (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Search Results</h3>
              {loading ? (
                <p className="text-sm text-gray-500">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-gray-500">No results found</p>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-[#e7efe4] p-2">
                  {searchResults.map((dua, index) => (
                    <div
                      key={dua?.id || `search-result-${index}`}
                      onClick={() => dua && setSelectedDua(dua)}
                      className="py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md text-sm border-b border-gray-100 last:border-b-0"
                    >
                      {dua?.name_en || "Unnamed Dua"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Accordion>
              {categories.map((cat) => (
                <AccordionItem
                  key={cat.id}
                  aria-label={`Category ${cat.name_en}`}
                  title={cat.name_en}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <div className="px-4 pb-3 pt-1 bg-gray-50">
                    {loadingSubcategories === cat.id ? (
                      <p className="text-sm text-gray-400">
                        Loading subcategories...
                      </p>
                    ) : subcategories[cat.id] ? (
                      <div className="space-y-2 text-gray-700">
                        {subcategories[cat.id].map((sub) => (
                          <div
                            key={`${cat.id}-${sub.id}`}
                            className="border-b border-gray-100 last:border-0"
                          >
                            <div
                              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 px-2 rounded"
                              onClick={() => handleSubcategoryClick(sub.id)}
                            >
                              <span className="font-medium">{sub.name_en}</span>
                              <span className="text-gray-400 text-xs">
                                {expandedSubcategory === sub.id ? "▼" : ""}
                              </span>
                            </div>

                            {loadingDuas === sub.id ? (
                              <p className="text-xs text-gray-400 pl-4 py-1">
                                Loading duas...
                              </p>
                            ) : (
                              expandedSubcategory === sub.id &&
                              duas[sub.id] && (
                                <div className="pl-4 py-2 space-y-2 bg-gray-50">
                                  {duas[sub.id].map((dua) => (
                                    <div
                                      key={dua.id}
                                      onClick={() => setSelectedDua(dua)}
                                      className={`border-l-2 pl-3 py-1 hover:border-blue-300 hover:bg-gray-100 cursor-pointer ${
                                        selectedDua && selectedDua.id === dua.id
                                          ? "border-green-500 bg-green-50 text-green-700"
                                          : "border-gray-200 text-blue-500"
                                      }`}
                                    >
                                      {dua.name_en}
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Click to load subcategories
                      </p>
                    )}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MainContent selectedDua={selectedDua} />
      </div>
    </div>
  );
}
