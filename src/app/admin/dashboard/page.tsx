"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Menu,
  LayoutDashboard,
  PackagePlus,
  Tags,
  ShoppingCart,
  TrendingUp,
  LogOut,
  Users,
  DollarSign,
  Upload,
  Trash2,
  Check,
  Plus,
  Minus,
  Edit,
  X,
  Package,
  Bell,
  Search,
  ImagePlus,
  Link2,
  Settings as SettingsIcon,
  Cloud,
  Database,
  Activity,
  Printer,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useSnackbar } from '@/context/SnackbarContext';
import { printInvoice } from '@/lib/printUtils';

// Premium Searchable Dropdown Component
const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        className="w-full px-4 py-2 border rounded-lg focus-within:ring-1 focus-within:ring-black focus-within:border-black bg-white cursor-pointer flex justify-between items-center text-sm min-h-[42px]"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span className="text-gray-500 text-xs">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b sticky top-0 bg-white">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              autoFocus
            />
          </div>
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition duration-150 ${value === option ? "bg-gray-50 font-semibold text-black" : "text-gray-700"
                    }`}
                >
                  {option}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Premium Searchable Multi-Select Dropdown Component for Colors
const SearchableMultiDropdown = ({
  options,
  selectedValues = [],
  onChange,
  placeholder = "Select..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    let updated;
    if (selectedValues.includes(option)) {
      updated = selectedValues.filter(val => val !== option);
    } else {
      updated = [...selectedValues, option];
    }
    onChange(updated);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm("");
        }}
        className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus-within:ring-2 focus-within:ring-brand-primary outline-none cursor-pointer flex justify-between items-center min-h-[44px] transition-all"
      >
        <div className="flex flex-wrap gap-1">
          {selectedValues.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedValues.map(val => (
              <span key={val} className="bg-white text-brand-on-surface text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border border-brand-surface-normal">
                {val}
              </span>
            ))
          )}
        </div>
        <span className="text-gray-500 text-xs">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-brand-surface-normal rounded-xl shadow-xl max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-brand-surface-normal sticky top-0 bg-white z-10">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm font-sans"
              autoFocus
            />
          </div>
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isChecked = selectedValues.includes(option);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleOption(option)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-brand-surface-low transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => { }}
                      className="w-4 h-4 accent-brand-primary rounded cursor-pointer"
                    />
                    <span className="text-brand-on-surface font-h font-bold">{option}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [orderFilterFromDate, setOrderFilterFromDate] = useState('');
  const [orderFilterToDate, setOrderFilterToDate] = useState('');
  const [orderFilterPayment, setOrderFilterPayment] = useState('all');
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    processingTimeFrom: 2, processingTimeTo: 4,
    deliveryTimeFrom: 5, deliveryTimeTo: 7,
    codDeliveryAmount: 50,
    adminUsername: '', adminPassword: '',
    salesTags: [] as { name: string, color: string }[]
  });
  const [adminPasswordState, setAdminPasswordState] = useState({ newPassword: '', confirmPassword: '' });
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isBannerEditMode, setIsBannerEditMode] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<any>(null);
  const [bannerData, setBannerData] = useState({ title: '', subtitle: '', buttonText: '', imageUrl: '', linkUrl: '' });
  const [bannerImage, setBannerImage] = useState<any>(null);
  const navigate = useRouter();

  // Edit mode state variables
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<any>(null);
  const [cloudinaryUsage, setCloudinaryUsage] = useState<any>(null);

  // Multi-Product Form State
  const initialProductState = {
    name: '',
    description: '',
    brand: '',
    team: '',
    category: [],
    subcategory: '',
    price: '',
    discount_price: '',
    stock: '',
    isAvailable: true,
    sizes: '',
    sizeStocks: [
      { size: 'S', stock: '' },
      { size: 'M', stock: '' },
      { size: 'L', stock: '' },
      { size: 'XL', stock: '' },
      { size: 'XXL', stock: '' }
    ],
    salesTag: '',
    colors: '',
    customNameNumber: false,
    tempImages: Array(5).fill(null), // Store 5 slots (Main Image + 4 Sub Images)
    existingImages: Array(5).fill(null)
  };

  const [productForms, setProductForms] = useState([initialProductState]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<any>(null);
  const [existingCategoryImage, setExistingCategoryImage] = useState('');
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const handleDirectFieldChange = (index, name, value) => {
    const updatedForms = [...productForms];
    if (name === 'category') {
      updatedForms[index] = {
        ...updatedForms[index],
        category: value,
        subcategory: ''
      };
    } else {
      updatedForms[index] = {
        ...updatedForms[index],
        [name]: value
      };
    }
    setProductForms(updatedForms);
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate.push('/admin');
    } else {
      fetchCategories();
      fetchTeams();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      fetchProducts();
      fetchOrders();
    }
    if (activeTab === 'dashboard') {
      fetchCloudinaryUsage();
    }
    if (activeTab === 'categories' || activeTab === 'products') {
      fetchCategories();
      fetchTeams();
    }
    if (activeTab === 'banner') {
      fetchBanner();
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCloudinaryUsage = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/settings/cloudinary-usage`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCloudinaryUsage(data);
      }
    } catch (error) {
      console.error('Error fetching cloudinary usage:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      const data = await response.json();
      if (response.ok) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');

      // Remove adminPassword from the payload so it isn't unintentionally updated
      const payload = { ...settings };
      delete payload.adminPassword;

      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showSnackbar('Success', 'Settings saved successfully!', 'success');
      } else {
        showSnackbar('Error', 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Error', 'Error saving settings', 'error');
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordState.newPassword !== adminPasswordState.confirmPassword) {
      showSnackbar('Error', 'New passwords do not match', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminPassword: adminPasswordState.newPassword })
      });
      if (response.ok) {
        showSnackbar('Success', 'Admin password changed successfully!', 'success');
        setIsAdminPasswordModalOpen(false);
        setAdminPasswordState({ newPassword: '', confirmPassword: '' });
      } else {
        showSnackbar('Error', 'Failed to change admin password', 'error');
      }
    } catch (error) {
      console.error('Error changing admin password:', error);
      showSnackbar('Error', 'Error changing admin password', 'error');
    }
  };

  const fetchBanner = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/banner`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('title', bannerData.title);
      formData.append('subtitle', bannerData.subtitle);
      formData.append('buttonText', bannerData.buttonText);
      formData.append('linkUrl', bannerData.linkUrl);
      if (bannerImage) {
        formData.append('image', bannerImage);
      }

      const url = isBannerEditMode
        ? `${API_BASE_URL}/api/banner/${editingBannerId}`
        : `${API_BASE_URL}/api/banner`;

      const method = isBannerEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        showSnackbar('Success', isBannerEditMode ? 'Banner updated successfully!' : 'Banner added successfully!', 'success');
        setBannerImage(null);
        setIsBannerEditMode(false);
        setEditingBannerId(null);
        setBannerData({ title: '', subtitle: '', buttonText: '', imageUrl: '', linkUrl: '' });
        fetchBanner();
      } else {
        const data = await response.json();
        showSnackbar('Error', data.message || 'Failed to save banner', 'error');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      showSnackbar('Error', 'Error saving banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/banner/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        showSnackbar('Success', 'Banner deleted successfully!', 'success');
        fetchBanner();
      }
    } catch (error) {
      showSnackbar('Error', 'Delete failed', 'error');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('name', newCategoryName.trim());
      if (newCategoryImage) {
        formData.append('image', newCategoryImage);
      }

      const url = isCategoryEditMode
        ? `${API_BASE_URL}/api/categories/${editingCategoryId}`
        : `${API_BASE_URL}/api/categories`;
      const method = isCategoryEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setNewCategoryName('');
        setNewCategoryImage(null);
        setExistingCategoryImage('');
        setShowAddCategory(false);
        setIsCategoryEditMode(false);
        setEditingCategoryId(null);
        fetchCategories();
        showSnackbar('Success', `Category ${isCategoryEditMode ? 'updated' : 'created'} successfully!`, 'success');
      } else {
        showSnackbar('Error', data.message || `Failed to ${isCategoryEditMode ? 'update' : 'create'} category`, 'error');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showSnackbar('Error', 'Error saving category', 'error');
    }
  };

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!selectedParentCategoryId || !newSubcategoryName.trim()) {
      showSnackbar('Warning', 'Please select a parent category and enter a subcategory name', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/categories/${selectedParentCategoryId}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subcategoryName: newSubcategoryName.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        setNewSubcategoryName('');
        fetchCategories();
        showSnackbar('Success', 'Subcategory created successfully!', 'success');
      } else {
        showSnackbar('Error', data.message || 'Failed to create subcategory', 'error');
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      showSnackbar('Error', 'Error creating subcategory', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All its subcategories will be deleted.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        fetchCategories();
        showSnackbar('Success', 'Category deleted successfully!', 'success');
      } else {
        showSnackbar('Error', data.message || 'Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar('Error', 'Error deleting category', 'error');
    }
  };

  const handleDeleteSubcategory = async (categoryId, subName) => {
    if (!window.confirm(`Are you sure you want to delete the subcategory "${subName}"?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/subcategories/${encodeURIComponent(subName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        fetchCategories();
        showSnackbar('Success', 'Subcategory deleted successfully!', 'success');
      } else {
        showSnackbar('Error', data.message || 'Failed to delete subcategory', 'error');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      showSnackbar('Error', 'Error deleting subcategory', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate.push('/admin');
  };

  const handleInputChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedForms = [...productForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [name]: type === 'checkbox' ? checked : value
    };
    setProductForms(updatedForms);
  };

  const handleSlotImageChange = (index, slotIndex, e) => {
    if (e.target.files && e.target.files[0]) {
      const updatedForms = [...productForms];
      const newImages = [...updatedForms[index].tempImages];
      newImages[slotIndex] = e.target.files[0];
      updatedForms[index].tempImages = newImages;
      setProductForms(updatedForms);
    }
  };

  const removeSlotImage = (index, slotIndex) => {
    const updatedForms = [...productForms];
    const newImages = [...updatedForms[index].tempImages];
    const existingImages = updatedForms[index].existingImages ? [...updatedForms[index].existingImages] : Array(5).fill(null);

    newImages[slotIndex] = null;
    existingImages[slotIndex] = null;

    updatedForms[index].tempImages = newImages;
    updatedForms[index].existingImages = existingImages;
    setProductForms(updatedForms);
  };

  const addFormRow = () => {
    if (productForms.length < 5) {
      setProductForms([...productForms, initialProductState]);
    }
  };

  const removeFormRow = (index) => {
    if (productForms.length > 1) {
      setProductForms(productForms.filter((_, i) => i !== index));
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    // Required fields validation
    for (let i = 0; i < productForms.length; i++) {
      const f = productForms[i];
      if (!f.name || !f.category || f.category.length === 0 || !f.price) {
        showSnackbar('Warning', `Please fill in all required fields (Product Name, Category, Price) for Product #${i + 1}!`, 'warning');
        return;
      }
    }

    setLoading(true);
    let successCount = 0;

    for (const form of productForms) {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'tempImages' || key === 'existingImages') return;

        if (key === 'sizeStocks') {
          const validSizeStocks = form[key].filter((s: any) => s.size && s.stock !== '');
          formData.append(key, JSON.stringify(validSizeStocks));
        } else if (key === 'sizes' || key === 'colors' || key === 'category') {
          let arr = [];
          if (Array.isArray(form[key])) {
            arr = form[key];
          } else if (form[key]) {
            arr = form[key]
              .split(',')
              .map((item: any) => item.trim())
              .filter((item: any) => item !== '');
          }

          formData.append(key, JSON.stringify(arr));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (form.salesTag) {
        const tagObj = settings.salesTags?.find(t => t.name === form.salesTag);
        if (tagObj) formData.append('salesTagColor', tagObj.color);
      }

      form.tempImages.filter(img => img !== null).forEach(image => {
        formData.append('images', image);
      });

      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error('Upload failed for one product');
      }
    }

    showSnackbar('Success', `Successfully added ${successCount} products!`, 'success');
    setProductForms([initialProductState]);
    fetchProducts();
    setActiveTab('orders');
    setLoading(false);
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();

    const form = productForms[0];
    if (!form.name || !form.category || form.category.length === 0 || !form.price) {
      showSnackbar('Warning', 'Please fill in all required fields (Product Name, Category, Price)!', 'warning');
      return;
    }

    setLoading(true);
    console.log("Integrated edit submission starting. Editing ID:", editingProductId);

    try {
      const form = productForms[0];
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        if (key === 'tempImages' || key === 'existingImages') return; // Skip image arrays

        if (key === 'sizeStocks') {
          const validSizeStocks = form[key].filter((s: any) => s.size && s.stock !== '');
          formData.append(key, JSON.stringify(validSizeStocks));
        } else if (key === 'sizes' || key === 'colors' || key === 'category') {
          const val = form[key];
          const arr = typeof val === 'string'
            ? val.split(',').map((item: any) => item.trim()).filter((item: any) => item !== '')
            : Array.isArray(val) ? val : [];
          formData.append(key, JSON.stringify(arr));
        } else {
          const val = form[key];
          formData.append(key, val !== null && val !== undefined ? val : '');
        }
      });

      const imageSlots = [];
      let newFileCount = 0;

      if (form.salesTag) {
        const tagObj = settings.salesTags?.find(t => t.name === form.salesTag);
        if (tagObj) formData.append('salesTagColor', tagObj.color);
      }

      for (let i = 0; i < 5; i++) {
        const file = form.tempImages?.[i];
        const existingUrl = form.existingImages?.[i];

        if (file) {
          formData.append('images', file);
          imageSlots.push(`new_${newFileCount}`);
          newFileCount++;
        } else if (existingUrl) {
          imageSlots.push(existingUrl);
        } else {
          imageSlots.push('empty');
        }
      }
      formData.append('imageSlots', JSON.stringify(imageSlots));

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        showSnackbar('Success', 'Product updated successfully!', 'success');
        setIsEditMode(false);
        setEditingProductId(null);
        setProductForms([initialProductState]);
        fetchProducts();
        setActiveTab('orders');
      } else {
        const data = await response.json();
        showSnackbar('Error', data.message || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Update failed:', error);
      showSnackbar('Error', 'Error updating product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleEditSubmit(e);
    } else {
      handleBulkSubmit(e);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (error) {
      showSnackbar('Error', 'Delete failed', 'error');
    }
  };



  const renderContent = () => {
    const sortedOrders = [...orders].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const orderNumberMap = new Map(sortedOrders.map((o, idx) => [o._id, (idx + 1).toString().padStart(4, '0')]));

    switch (activeTab) {
      case 'dashboard': {
        // --- Derived Analytics ---
        const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const deliveredOrders = orders.filter(o => o.status === 'Delivered');
        const processingOrders = orders.filter(o => o.status === 'Processing');
        const shippedOrders = orders.filter(o => o.status === 'Shipped');
        const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
        const codOrders = orders.filter(o => o.paymentMethod === 'cod');
        const onlineOrders = orders.filter(o => o.paymentMethod !== 'cod');
        const codRevenue = codOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const onlineRevenue = onlineOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        // Weekly bar chart data (last 7 days)
        const weeklyData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dateStr = d.toISOString().split('T')[0];
          const dayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
          const daySales = dayOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
          return { day: dayStr, sales: daySales, orders: dayOrders.length };
        });

        // Pie chart data for order status
        const pieData = [
          { name: 'Delivered', value: deliveredOrders.length, color: '#22c55e' },
          { name: 'Processing', value: processingOrders.length, color: '#3b82f6' },
          { name: 'Shipped', value: shippedOrders.length, color: '#f59e0b' },
        ].filter(d => d.value > 0);

        return (
          <div className="space-y-6">
            <h2 className="font-h text-base font-bold text-brand-on-surface uppercase tracking-tight">Sales & Analytics Overview</h2>

            {/* Top KPI Card */}
            <motion.div whileHover={{ y: -4 }} className="bg-white p-4 md:p-5 rounded-xl shadow-xl shadow-brand-primary/5 border border-brand-surface-normal flex items-center gap-3 group w-full md:w-64">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <ShoppingCart size={22} />
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest font-bold text-brand-on-surface-variant opacity-60 mb-0.5">Total Orders</p>
                <p className="font-h text-2xl md:text-3xl font-bold text-brand-on-surface">{orders.length}</p>
              </div>
            </motion.div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-brand-primary to-brand-primary-hover p-5 md:p-6 rounded-xl shadow-xl shadow-brand-primary/20 text-white">
                <p className="font-sans text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">Total Revenue</p>
                <p className="font-h text-3xl md:text-4xl font-bold">₹{totalSales.toLocaleString('en-IN')}</p>
                <p className="font-sans text-xs opacity-60 mt-2">From {orders.length} orders</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="bg-white p-5 md:p-6 rounded-xl shadow-xl border border-brand-surface-normal">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                  <p className="font-sans text-[10px] uppercase tracking-widest font-bold text-brand-on-surface-variant opacity-60">Cash on Delivery</p>
                </div>
                <p className="font-h text-2xl md:text-3xl font-bold text-brand-on-surface">₹{codRevenue.toLocaleString('en-IN')}</p>
                <p className="font-sans text-xs text-brand-on-surface-variant opacity-60 mt-2">{codOrders.length} orders</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="bg-white p-5 md:p-6 rounded-xl shadow-xl border border-brand-surface-normal">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  <p className="font-sans text-[10px] uppercase tracking-widest font-bold text-brand-on-surface-variant opacity-60">Online Payment</p>
                </div>
                <p className="font-h text-2xl md:text-3xl font-bold text-brand-on-surface">₹{onlineRevenue.toLocaleString('en-IN')}</p>
                <p className="font-sans text-xs text-brand-on-surface-variant opacity-60 mt-2">{onlineOrders.length} orders</p>
              </motion.div>
            </div>

            {/* Out of Stock / Sold Out Products */}
            {(() => {
              // Navigate to products tab and load product for editing
              const navigateToEdit = (product: any) => {
                setIsEditMode(true);
                setEditingProductId(product._id);
                const productFormState = {
                  name: product.name || '',
                  description: product.description || '',
                  brand: product.brand || '',
                  team: product.team || '',
                  category: product.category || '',
                  subcategory: product.subcategory || '',
                  price: product.price || '',
                  discount_price: product.discount_price || '',
                  stock: product.stock || 0,
                  isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
                  sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
                  sizeStocks: product.sizeStocks && product.sizeStocks.length > 0
                    ? product.sizeStocks.map((s: any) => ({ size: s.size, stock: s.stock }))
                    : [{ size: 'S', stock: '' }, { size: 'M', stock: '' }, { size: 'L', stock: '' }, { size: 'XL', stock: '' }, { size: 'XXL', stock: '' }],
                  salesTag: product.salesTag || '',
                  colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
                  customNameNumber: product.customNameNumber || false,
                  tempImages: Array(5).fill(null),
                  existingImages: [
                    product.images?.[0] || null,
                    product.images?.[1] || null,
                    product.images?.[2] || null,
                    product.images?.[3] || null,
                    product.images?.[4] || null
                  ]
                };
                setProductForms([productFormState]);
                setActiveTab('products');
              };

              // Products where ALL sizes are sold out
              const soldOutProducts = products.filter(p => {
                if (p.sizeStocks && p.sizeStocks.length > 0) {
                  return p.sizeStocks.every((s: any) => !s.stock || Number(s.stock) <= 0);
                }
                return !p.stock || Number(p.stock) <= 0;
              });

              // Products where SOME sizes are sold out (partial)
              const partialOutProducts = products.filter(p => {
                if (p.sizeStocks && p.sizeStocks.length > 0) {
                  const hasSomeOut = p.sizeStocks.some((s: any) => !s.stock || Number(s.stock) <= 0);
                  const hasAllOut = p.sizeStocks.every((s: any) => !s.stock || Number(s.stock) <= 0);
                  return hasSomeOut && !hasAllOut;
                }
                return false;
              });

              const totalCount = soldOutProducts.length + partialOutProducts.length;

              return (
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-brand-surface-normal">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-h text-base font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
                      Stock Alert
                    </h3>
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                      {totalCount} Products
                    </span>
                  </div>

                  {totalCount === 0 ? (
                    <p className="text-sm font-sans text-green-600 font-bold py-4 text-center">✅ All products are fully in stock!</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Fully Sold Out */}
                      {soldOutProducts.map(product => (
                        <div
                          key={product._id}
                          onClick={() => navigateToEdit(product)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors active:scale-[0.99]"
                        >
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-red-100">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">?</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-h text-sm font-bold text-brand-on-surface line-clamp-1">{product.name}</p>
                            <p className="font-sans text-xs text-red-500 font-bold mt-0.5">All sizes sold out</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-red-500 px-2.5 py-1 rounded-lg">Sold Out</span>
                            <Edit size={14} className="text-red-400" />
                          </div>
                        </div>
                      ))}
                      {/* Partially Out */}
                      {partialOutProducts.map(product => {
                        const outSizes = product.sizeStocks?.filter((s: any) => !s.stock || Number(s.stock) <= 0).map((s: any) => s.size) || [];
                        return (
                          <div
                            key={product._id}
                            onClick={() => navigateToEdit(product)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors active:scale-[0.99]"
                          >
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-orange-100">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">?</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-h text-sm font-bold text-brand-on-surface line-clamp-1">{product.name}</p>
                              <p className="font-sans text-xs text-orange-600 font-bold mt-0.5">Out: {outSizes.join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] font-black uppercase tracking-widest text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">Low Stock</span>
                              <Edit size={14} className="text-orange-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Storage Usage (Hidden for now) */}
            {/* {cloudinaryUsage && (
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-brand-surface-normal">
                <h3 className="font-h text-base font-bold mb-5 flex items-center gap-2">
                  <Cloud size={18} className="text-blue-500" /> Storage Usage
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Storage', used: cloudinaryUsage.storage?.usage, limit: cloudinaryUsage.storage?.limit, color: 'bg-blue-400', unit: 'GB', divisor: 1024*1024*1024 },
                    { label: 'Bandwidth', used: cloudinaryUsage.bandwidth?.usage, limit: cloudinaryUsage.bandwidth?.limit, color: 'bg-purple-400', unit: 'GB', divisor: 1024*1024*1024 },
                  ].map(item => {
                    const pct = item.limit ? (item.used / item.limit) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-sans font-bold mb-1.5">
                          <span className="text-brand-on-surface-variant opacity-60">{item.label}</span>
                          <span className="text-brand-on-surface">{item.used ? (item.used / item.divisor).toFixed(2) : 0} / {item.limit ? (item.limit / item.divisor).toFixed(2) : 0} {item.unit}</span>
                        </div>
                        <div className="w-full bg-brand-surface rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1 }}
                            className={`h-2 rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  
                  {cloudinaryUsage.media_limits && (
                    <div className="pt-4 border-t border-brand-surface-normal mt-4">
                      <p className="text-[10px] font-bold text-brand-on-surface-variant opacity-60 mb-3 uppercase tracking-widest">Image Limits</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-surface-low p-3 rounded-xl border border-brand-surface-normal">
                          <p className="text-[9px] font-bold text-brand-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Max File Size</p>
                          <p className="font-h text-sm font-bold text-brand-on-surface">{(cloudinaryUsage.media_limits.image_max_size_bytes / (1024*1024)).toFixed(0)} MB</p>
                        </div>
                        <div className="bg-brand-surface-low p-3 rounded-xl border border-brand-surface-normal">
                          <p className="text-[9px] font-bold text-brand-on-surface-variant opacity-60 uppercase tracking-widest mb-1">Max Resolution</p>
                          <p className="font-h text-sm font-bold text-brand-on-surface">{(cloudinaryUsage.media_limits.image_max_px / 1000000).toFixed(0)} MP</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>
        );
      }
      case 'products':
        return (
          <div className="space-y-5 max-w-6xl mx-auto">
            <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-lg shadow-sm border border-brand-surface-normal">
              <div>
                <h2 className="font-h text-base font-bold text-brand-on-surface uppercase tracking-tight">{isEditMode ? 'Edit Product' : 'Add New Products'}</h2>
                <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-1">{isEditMode ? 'Modify existing product details' : 'Add up to 5 products at once'}</p>
              </div>
              {!isEditMode && (
                <button
                  onClick={addFormRow}
                  disabled={productForms.length >= 5}
                  className="bg-brand-primary text-white text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50 shadow-lg shadow-brand-primary/20"
                >
                  <Plus size={18} /> Add Another Product
                </button>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {productForms.map((form, index) => (
                <div key={index} className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-brand-surface-normal relative group">
                  {productForms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFormRow(index)}
                      className="absolute top-4 md:p-6 right-6 bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-full transition-all hover:scale-110 shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}

                  <div className="mb-8 border-b border-brand-surface-normal pb-4">
                    <h3 className="font-h text-lg font-bold text-brand-on-surface">{isEditMode ? 'Product Details' : `Product #${index + 1}`}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                      <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Product Name*</label>
                      <input name="name" value={form.name} onChange={(e) => handleInputChange(index, e)} type="text" className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-lg transition-all" placeholder="e.g. Argentina Home Jersey" required />
                    </div>

                    <div>
                      <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Category*</label>
                      <SearchableMultiDropdown
                        options={categories.map(c => c.name)}
                        selectedValues={form.category}
                        onChange={(val) => handleDirectFieldChange(index, 'category', val)}
                        placeholder="Search Category..."
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Price (INR)*</label>
                      <input name="price" value={form.price} onChange={(e) => handleInputChange(index, e)} type="number" className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-lg transition-all" placeholder="e.g. 1999" required />
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Discount Price</label>
                      <input name="discount_price" value={form.discount_price} onChange={(e) => handleInputChange(index, e)} type="number" className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-lg transition-all" placeholder="e.g. 1499" />
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Stock per Size (Leave stock empty if size is not available)</label>
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                      {form.sizeStocks?.map((sizeObj: any, sIdx: number) => (
                        <div key={sIdx} className="flex flex-col border border-brand-surface-normal rounded-lg overflow-hidden bg-brand-surface">
                          <div className="bg-brand-surface-low text-center py-2 border-b border-brand-surface-normal font-bold text-brand-on-surface text-sm uppercase tracking-widest relative">
                            {sizeObj.size}
                            {sIdx >= 6 && (
                              <button
                                onClick={() => {
                                  const updatedSizeStocks = [...form.sizeStocks];
                                  updatedSizeStocks.splice(sIdx, 1);
                                  handleDirectFieldChange(index, 'sizeStocks', updatedSizeStocks);
                                }}
                                className="absolute right-1 top-1 text-red-400 hover:text-red-600"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            className="w-full text-center py-2 bg-transparent outline-none font-bold text-brand-primary"
                            value={sizeObj.stock}
                            onChange={(e) => {
                              const updatedSizeStocks = [...form.sizeStocks];
                              updatedSizeStocks[sIdx].stock = e.target.value;
                              handleDirectFieldChange(index, 'sizeStocks', updatedSizeStocks);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div>
                      <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Sales Tag</label>
                      <select
                        name="salesTag"
                        value={form.salesTag}
                        onChange={(e) => handleInputChange(index, e)}
                        className="w-full px-3 py-3 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-sm transition-all text-brand-on-surface"
                      >
                        <option value="">No Tag</option>
                        {(settings.salesTags || []).map((tag, tIdx) => (
                          <option key={tIdx} value={tag.name}>{tag.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Description*</label>
                    <textarea name="description" value={form.description} onChange={(e) => handleInputChange(index, e)} className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-sans text-brand-on-surface transition-all resize-y min-h-[120px]" placeholder="Detailed product description..." required></textarea>
                  </div>

                  <div className="mt-10">
                    <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-4 ml-2">Product Images (First is Main)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:p-6">
                      {Array(5).fill(null).map((_, slotIndex) => {
                        const file = form.tempImages[slotIndex];
                        const existingUrl = form.existingImages?.[slotIndex];
                        const previewUrl = file ? URL.createObjectURL(file) : existingUrl;
                        const isMain = slotIndex === 0;

                        return (
                          <div
                            key={slotIndex}
                            className={cn(
                              "relative aspect-[3/4] rounded-lg flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group cursor-pointer border-2",
                              previewUrl ? "border-transparent shadow-md" : isMain ? "border-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10" : "border-dashed border-brand-surface-normal bg-brand-surface hover:bg-brand-surface-low"
                            )}
                          >
                            {previewUrl ? (
                              <>
                                <img src={previewUrl} alt={`Slot ${slotIndex + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-white">{isMain ? 'Main Image' : `Sub Image ${slotIndex}`}</span>
                                  <span className="text-white/70 text-xs font-bold">{file ? 'New Upload' : 'Existing'}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeSlotImage(index, slotIndex); }}
                                  className="absolute top-3 right-3 bg-white/90 backdrop-blur text-red-600 p-2 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                <input type="file" accept="image/*" onChange={(e) => handleSlotImageChange(index, slotIndex, e)} className="hidden" />
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 group-active:scale-95", isMain ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" : "bg-white text-brand-on-surface shadow-sm")}>
                                  <Plus size={20} strokeWidth={3} />
                                </div>
                                <span className={cn("text-xs font-medium text-gray-500", isMain ? "text-brand-primary" : "text-brand-on-surface-variant opacity-60")}>
                                  {isMain ? 'Add Main' : `Add Image ${slotIndex}`}
                                </span>
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 md:p-6 sticky bottom-6 z-20">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingProductId(null);
                      setProductForms([initialProductState]);
                      setActiveTab('all-products');
                    }}
                    className="flex-1 bg-white border border-brand-surface-normal text-brand-on-surface px-8 py-2.5 rounded-lg font-semibold hover:bg-brand-surface-low transition-all shadow-xl hover:shadow-2xl active:scale-95"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "px-8 py-2.5 rounded-lg font-semibold transition-all shadow-xl shadow-brand-primary/30 active:scale-95 text-lg",
                    loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-2xl hover:shadow-brand-primary/40",
                    isEditMode ? "flex-[2] bg-brand-primary text-white" : "w-full bg-brand-primary text-white"
                  )}
                >
                  {isEditMode
                    ? (loading ? 'Saving Changes...' : 'Save Changes')
                    : (loading ? 'Publishing Products...' : `Publish ${productForms.length} Product(s)`)
                  }
                </button>
              </div>
            </form>
          </div>
        );
      case 'categories':
        return (
          <div className="space-y-5 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-lg shadow-sm border border-brand-surface-normal">
              <div>
                <h2 className="font-h text-base font-bold text-brand-on-surface uppercase tracking-tight">Category Management</h2>
                <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-1">Organize your store hierarchy</p>
              </div>
              <button
                onClick={() => {
                  setShowAddCategory(!showAddCategory);
                  if (!showAddCategory) {
                    setIsCategoryEditMode(false);
                    setEditingCategoryId(null);
                    setNewCategoryName('');
                    setNewCategoryImage(null);
                    setExistingCategoryImage('');
                  }
                }}
                className="bg-brand-primary text-white text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-black transition-colors"
              >
                {showAddCategory ? <X size={18} /> : <Plus size={18} />}
                {showAddCategory ? 'Cancel' : 'Add Category'}
              </button>
            </div>

            {showAddCategory ? (
              <div className="bg-white p-5 rounded-xl shadow-xl border border-brand-surface-normal">
                <h3 className="font-h text-lg font-bold text-brand-on-surface mb-2">{isCategoryEditMode ? 'Edit Category' : 'Create Category (Jersey Type)'}</h3>
                <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mb-8">{isCategoryEditMode ? 'Modify category details' : 'Add a new jersey type or category'}</p>
                <form onSubmit={handleCreateCategory} className="space-y-6 max-w-xl">
                  <div>
                    <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Category Name (Type)*</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-lg transition-all"
                      placeholder="e.g. Player Edition, Fan Edition, Retro"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Category Image (Optional)</label>

                    {(newCategoryImage || existingCategoryImage) && (
                      <div className="mb-4 w-32 h-40 rounded-xl overflow-hidden border border-brand-surface-normal bg-brand-surface-low relative group">
                        <img
                          src={newCategoryImage ? URL.createObjectURL(newCategoryImage) : existingCategoryImage}
                          alt="Category Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewCategoryImage(null);
                            setExistingCategoryImage('');
                          }}
                          className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white backdrop-blur-sm transition-all"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewCategoryImage(e.target.files[0]);
                        }
                      }}
                      className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-sans text-sm transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-black text-white px-4 py-2 rounded-md font-semibold w-full transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                  >
                    {isCategoryEditMode ? <Edit size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />} {isCategoryEditMode ? 'Update Category' : 'Save Category'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-xl shadow-xl border border-brand-surface-normal">
                {categories.length === 0 ? (
                  <div className="text-center py-16 bg-brand-surface rounded-md border-2 border-dashed border-brand-surface-normal">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-brand-on-surface-variant opacity-40">
                      <Tags size={32} />
                    </div>
                    <p className="font-h text-base font-bold text-brand-on-surface">No Categories Found</p>
                    <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-2">Create your first category using the button above</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:p-6">
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        className="bg-brand-surface rounded-2xl overflow-hidden hover:shadow-xl border border-brand-surface-normal transition-all duration-300 group relative flex flex-col"
                      >
                        {cat.imageUrl ? (
                          <div className="w-full h-48 overflow-hidden bg-brand-surface-low">
                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-brand-surface-low flex items-center justify-center">
                            <Tags size={48} className="text-brand-on-surface-variant opacity-20" />
                          </div>
                        )}
                        <div className="p-4 flex justify-between items-center bg-white z-10 border-t border-brand-surface-normal">
                          <h4 className="font-h text-lg font-bold text-brand-on-surface">{cat.name}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsCategoryEditMode(true);
                                setEditingCategoryId(cat._id);
                                setNewCategoryName(cat.name);
                                setNewCategoryImage(null);
                                setExistingCategoryImage(cat.imageUrl || '');
                                setShowAddCategory(true);
                              }}
                              className="text-brand-on-surface-variant opacity-40 hover:opacity-100 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition-all active:scale-90"
                              title="Edit Category"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="text-brand-on-surface-variant opacity-40 hover:opacity-100 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all active:scale-90"
                              title="Delete Category"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'all-products':
        return (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-lg shadow-sm border border-brand-surface-normal">
              <div>
                <h2 className="font-h text-base font-bold text-brand-on-surface uppercase tracking-tight">Manage Products</h2>
                <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-1">View, edit or delete existing inventory</p>
              </div>
              <button
                onClick={() => {
                  setProductForms([initialProductState]);
                  setIsEditMode(false);
                  setActiveTab('products');
                }}
                className="bg-brand-primary text-white text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg shadow-brand-primary/20"
              >
                <Plus size={18} />
                Add New Product
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-brand-surface-normal overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-brand-surface-low border-b border-brand-surface-normal">
                  <tr>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 rounded-tl-2xl w-24">Image</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Product Details</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Category</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Stock Qty</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Price</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 rounded-tr-2xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-normal">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-brand-surface-low/50 transition-colors group">
                      <td className="px-4 py-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-surface-low border border-brand-surface-normal">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">No Img</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <p className="font-h text-sm font-bold text-brand-on-surface line-clamp-2">
                          {product.name}
                          {product.salesTag && (
                            <span
                              className="ml-2 inline-block px-2 py-0.5 text-[10px] font-bold rounded-full text-white align-middle"
                              style={{ backgroundColor: settings?.salesTags?.find((t: any) => t.name === product.salesTag)?.color || '#ff0000' }}
                            >
                              {product.salesTag}
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-500 text-brand-on-surface-variant opacity-80">{Array.isArray(product.category) ? product.category.join(', ') : product.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 max-w-[200px]">
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
                          {product.sizeStocks && product.sizeStocks.length > 0 ? (
                            product.sizeStocks.map((sz: any, i: number) => (
                              <div key={i} className="flex flex-col items-center justify-center bg-brand-surface-low border border-brand-surface-normal rounded-md px-2 py-1 min-w-[40px] snap-start">
                                <span className="text-[10px] font-bold text-brand-on-surface-variant opacity-60">{sz.size}</span>
                                <span className="text-xs font-bold text-brand-primary">{sz.stock}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-brand-on-surface-variant opacity-60">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-1">
                          {product.discount_price ? (
                            <>
                              <span className="font-h text-base font-bold text-brand-on-surface">₹{product.discount_price}</span>
                              <span className="font-sans text-[10px] font-bold line-through text-brand-on-surface-variant opacity-40">₹{product.price}</span>
                            </>
                          ) : (
                            <span className="font-h text-base font-bold text-brand-on-surface">₹{product.price}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setIsEditMode(true);
                              setEditingProductId(product._id);

                              const productFormState = {
                                name: product.name || '',
                                description: product.description || '',
                                brand: product.brand || '',
                                team: product.team || '',
                                category: Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []),
                                subcategory: product.subcategory || '',
                                price: product.price || '',
                                discount_price: product.discount_price || '',
                                stock: product.stock || 0,
                                isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
                                sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
                                sizeStocks: product.sizeStocks && product.sizeStocks.length > 0
                                  ? product.sizeStocks.map((s: any) => ({ size: s.size, stock: s.stock }))
                                  : [
                                    { size: 'S', stock: '' },
                                    { size: 'M', stock: '' },
                                    { size: 'L', stock: '' },
                                    { size: 'XL', stock: '' },
                                    { size: 'XXL', stock: '' }
                                  ],
                                salesTag: product.salesTag || '',
                                colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
                                customNameNumber: product.customNameNumber || false,
                                tempImages: Array(5).fill(null),
                                existingImages: [
                                  product.images?.[0] || null,
                                  product.images?.[1] || null,
                                  product.images?.[2] || null,
                                  product.images?.[3] || null,
                                  product.images?.[4] || null
                                ]
                              };

                              setProductForms([productFormState]);
                              setActiveTab('products');
                            }}
                            className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-95"
                            title="Edit Product"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-sans font-bold text-sm uppercase tracking-widest">
                        No products found. Start by adding one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'orders': {
        const filteredOrders = orders.filter(order => {
          let matchesSearch = true;
          if (orderSearchQuery) {
            const q = orderSearchQuery.toLowerCase();
            matchesSearch =
              (order._id && order._id.toLowerCase().includes(q)) ||
              (order.trackingId && order.trackingId.toLowerCase().includes(q)) ||
              (order.shippingAddress?.name && order.shippingAddress.name.toLowerCase().includes(q)) ||
              (order.shippingAddress?.phone && order.shippingAddress.phone.toLowerCase().includes(q));
          }
          let matchesPayment = true;
          if (orderFilterPayment !== 'all') {
            matchesPayment = order.paymentMethod === orderFilterPayment;
          }
          let matchesStatus = true;
          if (orderFilterStatus !== 'all') {
            matchesStatus = order.status === orderFilterStatus;
          }
          let matchesDate = true;
          if (orderFilterFromDate || orderFilterToDate) {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            if (orderFilterFromDate) {
              const from = new Date(orderFilterFromDate);
              from.setHours(0, 0, 0, 0);
              if (orderDate < from) matchesDate = false;
            }
            if (orderFilterToDate) {
              const to = new Date(orderFilterToDate);
              to.setHours(23, 59, 59, 999);
              if (orderDate > to) matchesDate = false;
            }
          }
          return matchesSearch && matchesPayment && matchesStatus && matchesDate;
        });

        return (
          <div className="space-y-5">
            <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-lg shadow-sm border border-brand-surface-normal">
              <div>
                <h2 className="font-h text-base font-bold text-brand-on-surface uppercase tracking-tight">Customer Orders</h2>
                <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-1">Manage and track all shipments</p>
              </div>
              <div className="bg-brand-primary text-white text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20">
                <ShoppingCart size={18} />
                {filteredOrders.length} Orders Found
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-surface-normal grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant opacity-60 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant opacity-40" size={16} />
                  <input type="text" placeholder="ID, Name, Phone, Tracking" value={orderSearchQuery} onChange={(e) => { setOrderSearchQuery(e.target.value); setOrderCurrentPage(1); }} className="w-full pl-9 pr-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant opacity-60 mb-1">From Date</label>
                <input type="date" value={orderFilterFromDate} onChange={(e) => { setOrderFilterFromDate(e.target.value); setOrderCurrentPage(1); }} className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant opacity-60 mb-1">To Date</label>
                <input type="date" value={orderFilterToDate} onChange={(e) => { setOrderFilterToDate(e.target.value); setOrderCurrentPage(1); }} className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant opacity-60 mb-1">Payment Method</label>
                <select value={orderFilterPayment} onChange={(e) => { setOrderFilterPayment(e.target.value); setOrderCurrentPage(1); }} className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none text-sm cursor-pointer">
                  <option value="all">All Methods</option>
                  <option value="online">Online Payment</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-on-surface-variant opacity-60 mb-1">Status</label>
                <select value={orderFilterStatus} onChange={(e) => { setOrderFilterStatus(e.target.value); setOrderCurrentPage(1); }} className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none text-sm cursor-pointer">
                  <option value="all">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl border border-brand-surface-normal overflow-hidden overflow-x-auto p-4">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-brand-surface-low border-b border-brand-surface-normal">
                  <tr>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 rounded-tl-2xl">Order ID & Date</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Customer</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Items</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Address</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Total & Payment</th>
                    <th className="px-6 py-2.5 font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 rounded-tr-2xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-surface-normal">
                  {filteredOrders.slice((orderCurrentPage - 1) * 20, orderCurrentPage * 20).map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => {
                        setViewingOrderId(order._id);
                        setActiveTab('order-details');
                      }}
                      className="hover:bg-brand-surface-low/50 transition-colors align-top group cursor-pointer"
                    >
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-sm font-bold text-brand-primary">#{orderNumberMap.get(order._id)}</span>
                          <span className="text-xs font-sans font-bold text-brand-on-surface-variant opacity-60">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-h font-bold text-brand-on-surface">{order.shippingAddress?.name || 'N/A'}</span>
                          <span className="text-xs font-sans font-bold text-brand-on-surface-variant opacity-60">{order.user?.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-3">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 bg-brand-surface-low p-2 rounded-xl border border-brand-surface-normal group-hover:bg-white transition-colors">
                              <img src={item.image} className="w-10 h-10 object-cover rounded-lg bg-white" alt={item.name} />
                              <div className="min-w-0">
                                <p className="text-xs font-h font-bold line-clamp-1">{item.name}</p>
                                <p className="text-[10px] font-sans font-bold text-brand-on-surface-variant opacity-60 mt-0.5">Size: {item.size} × {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xs font-sans text-brand-on-surface max-w-[200px] leading-relaxed">
                          <p className="font-bold text-brand-on-surface">{order.shippingAddress?.locality}</p>
                          <p className="text-brand-on-surface-variant opacity-80">{order.shippingAddress?.address}</p>
                          <p className="text-brand-on-surface-variant opacity-80">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-base font-bold text-brand-on-surface">₹{order.totalAmount}</span>
                          <span className={cn(
                            "text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-md inline-block w-max",
                            order.paymentMethod === 'cod' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                          )}>
                            {order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'ONLINE PAID'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-3">
                          <span className={cn(
                            "text-xs font-bold px-4 py-2 rounded-xl border w-max",
                            order.status === 'Processing' ? "bg-blue-50 text-blue-600 border-blue-200" :
                              order.status === 'Shipped' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                order.status === 'Delivered' ? "bg-green-50 text-green-600 border-green-200" :
                                  "bg-red-50 text-red-600 border-red-200"
                          )}>
                            {order.status === 'Processing' ? '⏳ Processing' :
                              order.status === 'Shipped' ? '🚚 Shipped' :
                                order.status === 'Delivered' ? '✅ Delivered' :
                                  '❌ Cancelled'}
                          </span>
                          {order.trackingId && (
                            <div className="text-[10px] font-sans font-bold text-brand-on-surface-variant opacity-80 uppercase tracking-widest">
                              Track ID: <span className="text-brand-on-surface">{order.trackingId}</span>
                            </div>
                          )}
                          <span className="text-[10px] text-brand-primary font-bold hover:underline mt-2">View Details &rarr;</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length > 20 && (
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-brand-surface-normal">
                <button
                  onClick={() => setOrderCurrentPage(p => Math.max(1, p - 1))}
                  disabled={orderCurrentPage === 1}
                  className="px-4 py-2 bg-brand-surface rounded-lg disabled:opacity-50 text-sm font-bold text-brand-on-surface hover:bg-brand-surface-normal transition-colors"
                >
                  &larr; Previous
                </button>
                <span className="text-sm font-bold text-brand-on-surface-variant opacity-80">
                  Page {orderCurrentPage} of {Math.ceil(filteredOrders.length / 20)}
                </span>
                <button
                  onClick={() => setOrderCurrentPage(p => Math.min(Math.ceil(filteredOrders.length / 20), p + 1))}
                  disabled={orderCurrentPage >= Math.ceil(filteredOrders.length / 20)}
                  className="px-4 py-2 bg-brand-surface rounded-lg disabled:opacity-50 text-sm font-bold text-brand-on-surface hover:bg-brand-surface-normal transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        );
      }
      case 'order-details': {
        const order = orders.find(o => o._id === viewingOrderId);
        if (!order) {
          return (
            <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-brand-surface-normal">
              <p className="font-h font-bold text-lg mb-4 text-brand-on-surface">Order not found.</p>
              <button onClick={() => setActiveTab('orders')} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold">
                Back to Orders
              </button>
            </div>
          );
        }

        const orderNumber = orderNumberMap.get(order._id) || '0000';

        const handlePrintInvoice = () => printInvoice(order, orderNumber);

        return (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-xl shadow-sm border border-brand-surface-normal">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveTab('orders')} className="p-2 hover:bg-brand-surface rounded-lg transition-colors font-bold text-brand-on-surface-variant flex items-center gap-2">
                  &larr; Back
                </button>
                <div>
                  <h2 className="font-h text-xl font-bold text-brand-on-surface">Order #{orderNumberMap.get(order._id)}</h2>
                  <p className="text-sm text-brand-on-surface-variant opacity-60 font-sans font-bold">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">                <button onClick={handlePrintInvoice} className="bg-brand-primary text-white text-sm px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-primary/20 flex items-center gap-2 transition-transform active:scale-95">
                <Printer size={16} />
                Print Invoice
              </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Items and Update Status */}
              <div className="md:col-span-2 space-y-6">
                {/* Update Status & Tracking */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-surface-normal">
                  <h3 className="font-h text-base font-bold mb-4">Update Order</h3>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-brand-on-surface-variant opacity-60 mb-1">Status</label>
                      <select
                        value={order.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          const token = localStorage.getItem('adminToken');
                          await fetch(`${API_BASE_URL}/api/orders/${order._id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ status: newStatus })
                          });
                          fetchOrders();
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-normal outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer text-sm font-bold"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                    <div className="flex-1 flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-brand-on-surface-variant opacity-60 mb-1">Tracking ID</label>
                        <input
                          id={`tracking-input-${order._id}`}
                          type="text"
                          placeholder="Enter Tracking ID..."
                          defaultValue={order.trackingId || ''}
                          className="w-full px-4 py-2.5 rounded-xl border border-brand-surface-normal outline-none focus:ring-2 focus:ring-brand-primary text-sm font-mono font-bold"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          const val = (document.getElementById(`tracking-input-${order._id}`) as HTMLInputElement)?.value;
                          if (val !== undefined && val !== order.trackingId) {
                            const newStatus = val.trim() ? 'Shipped' : order.status;
                            const token = localStorage.getItem('adminToken');
                            await fetch(`${API_BASE_URL}/api/orders/${order._id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ status: newStatus, trackingId: val })
                            });
                            showSnackbar('Success', 'Updated', 'success');
                            fetchOrders();
                          }
                        }}
                        className="bg-brand-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm h-[42px] flex items-center justify-center shadow-md active:scale-95 transition-transform"
                        title="Save Tracking ID"
                      >
                        <Check size={16} />
                      </button>
                      {order.trackingId && (
                        <a
                          href={`https://myspeedpost.com/?n=${order.trackingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-bold text-sm h-[42px] flex items-center justify-center shadow-md active:scale-95 transition-transform shrink-0 whitespace-nowrap"
                          title="Track on Speed Post"
                        >
                          Track Order
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-on-surface-variant opacity-60 mt-3">* Changes to Status are saved automatically. Click the check button to save the Tracking ID.</p>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm border border-brand-surface-normal overflow-hidden">
                  <div className="p-4 border-b border-brand-surface-normal bg-brand-surface-low">
                    <h3 className="font-h text-base font-bold">Order Items ({order.items.length})</h3>
                  </div>
                  <div className="divide-y divide-brand-surface-normal">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 flex gap-4 items-center hover:bg-brand-surface-low/30 transition-colors">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-brand-surface-normal" />
                        <div className="flex-1">
                          <h4 className="font-h font-bold text-brand-on-surface">{item.name}</h4>
                          <div className="flex gap-3 mt-1 text-xs font-bold text-brand-on-surface-variant opacity-80">
                            <span>Size: {item.size}</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right font-h font-bold text-brand-on-surface">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Customer & Summary */}
              <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-surface-normal">
                  <h3 className="font-h text-base font-bold mb-4">Customer Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-on-surface-variant opacity-60 mb-0.5">Name</p>
                      <p className="font-sans font-bold text-sm text-brand-on-surface">{order.shippingAddress?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-on-surface-variant opacity-60 mb-0.5">Phone</p>
                      <p className="font-sans font-bold text-sm text-brand-on-surface">{order.shippingAddress?.phone || order.user?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-on-surface-variant opacity-60 mb-0.5">Shipping Address</p>
                      <p className="font-sans font-bold text-sm text-brand-on-surface leading-relaxed mt-1">
                        {order.shippingAddress?.locality}<br />
                        {order.shippingAddress?.address}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                        {order.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-brand-surface-normal">
                  <h3 className="font-h text-base font-bold mb-4">Payment Summary</h3>
                  <div className="space-y-3 font-sans font-bold text-sm">
                    <div className="flex justify-between text-brand-on-surface-variant opacity-80">
                      <span>Subtotal</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-brand-on-surface-variant opacity-80">
                      <span>Method</span>
                      <span className={cn("uppercase", order.paymentMethod === 'cod' ? "text-orange-600" : "text-green-600")}>
                        {order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'ONLINE PAID'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-brand-surface-normal flex justify-between text-base text-brand-on-surface">
                      <span>Total</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'banner':
        return (
          <div className="space-y-5 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-lg shadow-sm border border-brand-surface-normal">
              <div>
                <h2 className="font-h text-base font-bold text-brand-on-surface uppercase tracking-tight">
                  {isBannerEditMode ? 'Edit Banner' : editingBannerId === 'new' ? 'Create Banner' : 'Home Banners'}
                </h2>
                <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-1">
                  {isBannerEditMode || editingBannerId === 'new' ? 'Configure banner details and image' : 'Manage your storefront hero section'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {!isBannerEditMode && editingBannerId !== 'new' && (
                  <button
                    onClick={() => {
                      setEditingBannerId('new');
                      setBannerData({ title: '', subtitle: '', buttonText: '', imageUrl: '', linkUrl: '' });
                      setBannerImage(null);
                    }}
                    className="bg-brand-primary text-white text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg shadow-brand-primary/20"
                  >
                    <Plus size={18} /> New Banner
                  </button>
                )}
                {(isBannerEditMode || editingBannerId === 'new') && (
                  <button
                    onClick={() => {
                      setIsBannerEditMode(false);
                      setEditingBannerId(null);
                    }}
                    className="bg-brand-surface text-brand-on-surface hover:bg-brand-surface-low text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors border border-brand-surface-normal"
                  >
                    <X size={18} /> Cancel
                  </button>
                )}
              </div>
            </div>

            {isBannerEditMode || editingBannerId === 'new' ? (
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl border border-brand-surface-normal">
                <form onSubmit={handleBannerSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:p-6">
                    <div className="space-y-5">
                      <div>
                        <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Banner Title*</label>
                        <input
                          type="text"
                          value={bannerData.title}
                          onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                          className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-base transition-all"
                          placeholder="e.g. Wear Your Passion"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Banner Subtitle / Details*</label>
                        <textarea
                          rows={4}
                          value={bannerData.subtitle}
                          onChange={(e) => setBannerData({ ...bannerData, subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none resize-none font-sans text-brand-on-surface transition-all"
                          placeholder="Enter engaging banner details here..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-6">
                        <div>
                          <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Call to Action (Button)</label>
                          <input
                            type="text"
                            value={bannerData.buttonText}
                            onChange={(e) => setBannerData({ ...bannerData, buttonText: e.target.value })}
                            className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-lg transition-all"
                            placeholder="e.g. Shop Now"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Redirect Link (Path)</label>
                          <input
                            type="text"
                            value={bannerData.linkUrl}
                            onChange={(e) => setBannerData({ ...bannerData, linkUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none font-h font-bold text-lg transition-all"
                            placeholder="e.g. /category/jerseys"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 h-full flex flex-col">
                      <label className="block font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60 mb-2 ml-2">Banner Hero Image*</label>
                      <div className="flex-1 relative rounded-xl overflow-hidden group cursor-pointer border-2 border-dashed border-brand-surface-normal hover:border-brand-primary/50 transition-colors bg-brand-surface min-h-[300px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBannerImage(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          required={!isBannerEditMode}
                        />
                        {bannerImage || bannerData.imageUrl ? (
                          <>
                            <img
                              src={bannerImage ? URL.createObjectURL(bannerImage) : bannerData.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-3">
                                <Upload size={24} />
                              </div>
                              <span className="text-white font-h font-bold tracking-widest uppercase">Change Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/10 mb-6 group-hover:scale-110 transition-transform">
                              <Upload size={32} />
                            </div>
                            <p className="font-h text-base font-bold text-brand-on-surface mb-2">Upload Banner Image</p>
                            <p className="font-sans text-[10px] text-brand-on-surface-variant opacity-40 mt-4">Recommended: Portrait/Square ratio (e.g., 4:5 ratio / 1080x1350px or 1:1 ratio) for best mobile visibility.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-brand-surface-normal flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "px-5 py-2.5 rounded-lg font-semibold transition-all shadow-xl shadow-brand-primary/30 active:scale-95 text-lg min-w-[250px]",
                        loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-2xl hover:shadow-brand-primary/40",
                        "bg-brand-primary text-white"
                      )}
                    >
                      {loading ? 'Processing...' : isBannerEditMode ? 'Save Changes' : 'Publish Banner'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {banners.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-xl border border-brand-surface-normal shadow-sm">
                    <div className="w-8 h-8 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-6 text-brand-on-surface-variant opacity-40">
                      <ImagePlus size={36} />
                    </div>
                    <p className="font-h text-lg font-bold text-brand-on-surface">No Banners Configured</p>
                    <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-2 mb-8">Add a banner to display on the storefront hero section</p>
                    <button
                      onClick={() => {
                        setEditingBannerId('new');
                        setBannerData({ title: '', subtitle: '', buttonText: '', imageUrl: '', linkUrl: '' });
                        setBannerImage(null);
                      }}
                      className="bg-brand-primary text-white px-4 py-2 rounded-xl font-h font-bold shadow-lg shadow-brand-primary/20 hover:bg-black transition-colors inline-flex items-center gap-2"
                    >
                      <Plus size={20} /> Create First Banner
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {banners.map((banner) => (
                      <div key={banner._id} className="bg-white rounded-xl shadow-xl border border-brand-surface-normal overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="relative aspect-video overflow-hidden">
                          <img src={banner.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={banner.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setIsBannerEditMode(true);
                                setEditingBannerId(banner._id);
                                setBannerData({
                                  title: banner.title,
                                  subtitle: banner.subtitle,
                                  buttonText: banner.buttonText,
                                  imageUrl: banner.imageUrl,
                                  linkUrl: banner.linkUrl || ''
                                });
                              }}
                              className="bg-white/90 backdrop-blur-md text-brand-on-surface p-2.5 rounded-xl hover:bg-brand-primary hover:text-white transition-colors shadow-lg active:scale-95"
                              title="Edit Banner"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner._id)}
                              className="bg-white/90 backdrop-blur-md text-red-600 p-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-lg active:scale-95"
                              title="Delete Banner"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 md:p-6 relative">
                          <div className="absolute -top-4 md:p-6 right-6 bg-brand-primary text-white text-xs font-medium text-gray-500 px-3 py-1.5 rounded-md shadow-lg shadow-brand-primary/30 z-10">
                            Active
                          </div>
                          <h3 className="font-h text-base font-bold text-brand-on-surface line-clamp-1 mb-2">{banner.title}</h3>
                          <p className="font-sans text-sm text-brand-on-surface-variant opacity-80 line-clamp-2 leading-relaxed">{banner.subtitle}</p>

                          <div className="mt-6 pt-4 border-t border-brand-surface-normal flex items-center justify-between">
                            <span className="font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-50 flex items-center gap-1">
                              <Link2 size={12} /> {banner.linkUrl ? 'Has Link' : 'No Link'}
                            </span>
                            <span className="font-sans text-xs font-medium text-gray-500 text-brand-primary bg-brand-primary/5 px-2 py-1 rounded">
                              {banner.buttonText || 'No Button'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-lg shadow-sm border border-brand-surface-normal">
              <div>
                <h2 className="font-h text-base font-bold text-brand-on-surface uppercase tracking-tight">Global Settings</h2>
                <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-1">Manage store delivery times, fees, and admin credentials</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Delivery Settings */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-surface-normal">
                <h3 className="font-h text-lg font-bold text-brand-on-surface mb-6 flex items-center gap-2">
                  <Package size={20} className="text-brand-primary" /> Delivery Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-sans text-sm font-bold text-brand-on-surface">Processing Time (Days)</h4>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">From</label>
                        <input
                          type="number"
                          value={settings.processingTimeFrom}
                          onChange={(e) => setSettings({ ...settings, processingTimeFrom: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">To</label>
                        <input
                          type="number"
                          value={settings.processingTimeTo}
                          onChange={(e) => setSettings({ ...settings, processingTimeTo: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-sans text-sm font-bold text-brand-on-surface">Delivery Time (Days)</h4>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">From</label>
                        <input
                          type="number"
                          value={settings.deliveryTimeFrom}
                          onChange={(e) => setSettings({ ...settings, deliveryTimeFrom: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">To</label>
                        <input
                          type="number"
                          value={settings.deliveryTimeTo}
                          onChange={(e) => setSettings({ ...settings, deliveryTimeTo: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-sans text-sm font-bold text-brand-on-surface">Cash on Delivery (COD) Amount</h4>
                    <div>
                      <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">Amount (INR)</label>
                      <input
                        type="number"
                        value={settings.codDeliveryAmount}
                        onChange={(e) => setSettings({ ...settings, codDeliveryAmount: Number(e.target.value) })}
                        className="w-full md:w-1/2 px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>


              {/* Sales Tags Configuration */}
              <div className="bg-white p-6 rounded-2xl border border-brand-surface-normal shadow-sm mb-6">
                <h3 className="font-h text-lg font-bold text-brand-on-surface mb-4">Sales Tags Configuration</h3>
                <div className="space-y-4">
                  {(settings.salesTags || []).map((tag, index) => (
                    <div key={index} className="flex items-center gap-4 bg-brand-surface p-3 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">Tag Name</label>
                        <input
                          type="text"
                          value={tag.name}
                          onChange={(e) => {
                            const newTags = [...settings.salesTags];
                            newTags[index].name = e.target.value;
                            setSettings({ ...settings, salesTags: newTags });
                          }}
                          className="w-full px-3 py-2 bg-white rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                          placeholder="e.g. New Arrival"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">Color</label>
                        <input
                          type="color"
                          value={tag.color}
                          onChange={(e) => {
                            const newTags = [...settings.salesTags];
                            newTags[index].color = e.target.value;
                            setSettings({ ...settings, salesTags: newTags });
                          }}
                          className="w-full h-10 rounded-md cursor-pointer border-none bg-transparent"
                        />
                      </div>
                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = [...settings.salesTags];
                            newTags.splice(index, 1);
                            setSettings({ ...settings, salesTags: newTags });
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        salesTags: [...(settings.salesTags || []), { name: 'New Tag', color: '#ff0000' }]
                      });
                    }}
                    className="flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover font-bold text-sm uppercase tracking-widest mt-2"
                  >
                    <Plus size={16} />
                    Add Sales Tag
                  </button>
                </div>
              </div>

              {/* Security Settings Configuration */}
              <div className="bg-white p-6 rounded-2xl border border-brand-surface-normal shadow-sm mb-6">
                <h3 className="font-h text-lg font-bold text-brand-on-surface mb-4">Security Settings</h3>
                <div className="space-y-4 max-w-sm mb-6">
                  <div>
                    <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">Admin Username</label>
                    <input
                      type="text"
                      value={settings.adminUsername || ''}
                      onChange={(e) => setSettings({ ...settings, adminUsername: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminPasswordModalOpen(true)}
                  className="bg-brand-surface-low text-brand-on-surface hover:bg-brand-surface border border-brand-surface-normal px-6 py-3 rounded-lg font-bold text-sm transition-colors"
                >
                  Change Admin Password
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-black text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Save Settings
                </button>
              </div>
            </form>

            {/* Admin Password Change Modal */}
            {isAdminPasswordModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                  <button
                    type="button"
                    onClick={() => setIsAdminPasswordModalOpen(false)}
                    className="absolute top-4 right-4 text-brand-on-surface-variant hover:text-brand-on-surface"
                  >
                    <X size={20} />
                  </button>
                  <h2 className="font-h text-xl font-bold text-brand-on-surface mb-4">Change Admin Password</h2>
                  <form onSubmit={handleAdminPasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          required
                          value={adminPasswordState.newPassword}
                          onChange={e => setAdminPasswordState({ ...adminPasswordState, newPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-on-surface-variant opacity-60 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          required
                          value={adminPasswordState.confirmPassword}
                          onChange={e => setAdminPasswordState({ ...adminPasswordState, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 pr-10 bg-brand-surface rounded-md border-none focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold mt-4 shadow-lg hover:shadow-xl active:scale-95 transition-all"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={20} /> },
    { id: 'orders', label: 'Customer Orders', icon: <ShoppingCart size={20} /> },
    { id: 'products', label: 'Add Products', icon: <PackagePlus size={20} /> },
    { id: 'all-products', label: 'Manage Products', icon: <Package size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Tags size={20} /> },
    { id: 'banner', label: 'Home Banner', icon: <LayoutDashboard size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-brand-surface font-sans flex text-brand-on-surface">
      {/* Sidebar */}
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`w-[240px] bg-white border-r border-brand-surface-normal flex flex-col fixed h-full z-50 shadow-2xl shadow-brand-primary/5 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 pb-4 hidden">
          <Link href="/" className="inline-block">
            <h1 className="font-h text-base font-bold uppercase tracking-tight">
              Kit<span className="text-brand-primary">Bay</span>
            </h1>
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant opacity-60 mt-1">Admin Portal</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'products' && isEditMode);
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'products' && !isEditMode) {
                    setProductForms([initialProductState]);
                  }
                  setActiveTab(item.id); setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all relative group overflow-hidden",
                  isActive
                    ? "text-brand-primary bg-brand-primary/10 shadow-sm"
                    : "text-brand-on-surface-variant hover:bg-brand-surface-low hover:text-brand-on-surface"
                )}
              >
                {isActive && (
                  <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-r-full" />
                )}
                <div className={cn("transition-transform group-hover:scale-110", isActive ? "scale-110 text-brand-primary" : "text-brand-on-surface-variant opacity-70 group-hover:opacity-100")}>
                  {item.icon}
                </div>
                <span>{item.id === 'products' && isEditMode ? 'Edit Product' : item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 md:p-6 border-t border-brand-surface-normal">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-50 text-red-600 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 border border-red-100"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] w-full max-w-[100vw] flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="md:hidden h-16 bg-white/80 backdrop-blur-xl border-b border-brand-surface-normal flex items-center justify-between px-4 md:px-5 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-brand-surface-low text-brand-on-surface"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="font-h text-base md:text-lg font-bold uppercase tracking-tight text-brand-on-surface line-clamp-1">
                {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500 text-brand-on-surface-variant opacity-60 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:p-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-on-surface-variant opacity-40" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-brand-surface pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-brand-primary outline-none font-sans text-sm w-64 transition-all"
              />
            </div>
            <button className="relative p-3 bg-brand-surface rounded-xl hover:bg-brand-surface-low transition-colors text-brand-on-surface-variant">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-brand-surface-normal">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-h font-bold">
                A
              </div>
              <div className="hidden md:block">
                <p className="font-sans text-sm font-bold text-brand-on-surface">Admin User</p>
                <p className="font-sans text-xs font-medium text-gray-500 text-brand-on-surface-variant opacity-60">Superadmin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1400px] mx-auto w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
