// src/components/ui/select/Select.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';

const Select = ({
    options = [],
    value = null,
    onChange = () => { },
    placeholder = 'Select an option...',
    isMulti = false,
    isSearchable = false,
    isClearable = true,
    isDisabled = false,
    size = 'md',
    variant = 'default'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const selectRef = useRef(null);
    const searchRef = useRef(null);

    const sizeClasses = {
        sm: 'text-sm py-1.5 px-3',
        md: 'text-base py-2.5 px-4',
        lg: 'text-lg py-3 px-5'
    };

    const variantClasses = {
        default: 'bg-background border-gray-300 hover:border-gray-400',
        filled: 'bg-gray-100 border-gray-200 hover:bg-gray-200',
        ghost: 'bg-transparent border-gray-200 hover:bg-gray-50'
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && isSearchable && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen, isSearchable]);

    // --- NEW LOGIC: FLATTEN GROUPS ---
    // This hook converts grouped options into a flat list for rendering/keyboard navigation
    // while preserving the headers as non-selectable items.
    const flattenedOptions = useMemo(() => {
        const term = searchTerm.toLowerCase();
        
        // check if data is grouped (has .options property)
        const isGrouped = options.some(opt => opt.options && Array.isArray(opt.options));

        if (!isGrouped) {
            // Standard flat behavior
            return options.filter(opt => 
                opt.label.toLowerCase().includes(term)
            );
        }

        // Grouped behavior
        const result = [];
        options.forEach(group => {
            // Filter children within the group
            const matchingChildren = group.options.filter(opt => 
                opt.label.toLowerCase().includes(term)
            );

            // Only add group header if it has matching children
            if (matchingChildren.length > 0) {
                // Add the Group Header (flagged as isHeader)
                result.push({ 
                    ...group, 
                    value: `group-${group.label}`, // unique key
                    isHeader: true 
                });
                // Add the Children
                result.push(...matchingChildren);
            }
        });
        return result;
    }, [options, searchTerm]);

    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchTerm]);

    const handleSelect = (option) => {
        if (option.isHeader) return; // Prevent clicking headers

        if (isMulti) {
            const newValue = value || [];
            const exists = newValue.find(v => v.value === option.value);
            if (exists) {
                onChange(newValue.filter(v => v.value !== option.value));
            } else {
                onChange([...newValue, option]);
            }
        } else {
            onChange(option);
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    const handleRemove = (option, e) => {
        e.stopPropagation();
        if (isMulti) {
            onChange(value.filter(v => v.value !== option.value));
        } else {
            onChange(null);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(isMulti ? [] : null);
    };

    const handleKeyDown = (e) => {
        if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsOpen(true);
            return;
        }

        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => {
                    let next = prev + 1;
                    // Skip headers when moving down
                    while (next < flattenedOptions.length && flattenedOptions[next].isHeader) {
                        next++;
                    }
                    return next < flattenedOptions.length ? next : prev;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => {
                    let next = prev - 1;
                    // Skip headers when moving up
                    while (next >= 0 && flattenedOptions[next].isHeader) {
                        next--;
                    }
                    return next >= 0 ? next : 0;
                });
                break;
            case 'Enter':
                e.preventDefault();
                const option = flattenedOptions[highlightedIndex];
                if (option && !option.isHeader) {
                    handleSelect(option);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                break;
            default:
                break;
        }
    };

    const isSelected = (option) => {
        if (option.isHeader) return false;
        if (isMulti) {
            return value?.some(v => v.value === option.value);
        }
        return value?.value === option.value;
    };

    const getDisplayValue = () => {
        if (isMulti && value?.length > 0) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    {value.map(v => (
                        <span
                            key={v.value}
                            className="inline-flex items-center gap-1 bg-red-100 text-red-700 rounded-md px-2 py-0.5 text-sm font-medium transition-colors hover:bg-red-200"
                        >
                            {v.label}
                            <X
                                size={14}
                                className="cursor-pointer hover:text-red-900 transition-colors"
                                onClick={(e) => handleRemove(v, e)}
                            />
                        </span>
                    ))}
                </div>
            );
        }
        if (value && !Array.isArray(value)) {
            return <span className="text-gray-900">{value.label}</span>;
        }
        return <span className="text-gray-400">{placeholder}</span>;
    };

    const showClearButton = isClearable && (
        (isMulti && value?.length > 0) || (!isMulti && value)
    );

    return (
        <div ref={selectRef} className="relative w-full">
            <div
                className={`
          relative flex items-center justify-between border rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isOpen ? 'ring-2 ring-red-500 border-red-500' : ''}
          ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
        `}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                tabIndex={isDisabled ? -1 : 0}
            >
                <div className="flex-1 min-w-0 mr-2">
                    {getDisplayValue()}
                </div>

                <div className="flex items-center gap-1">
                    {showClearButton && (
                        <X
                            size={18}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={handleClear}
                        />
                    )}
                    <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>
            </div>

            <div
                className={`
          absolute z-50 w-full mt-2 bg-background border border-gray-200 rounded-lg shadow-lg
          transition-all duration-200 ease-in-out origin-top
          ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}
        `}
            >
                {isSearchable && (
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                ref={searchRef}
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                <div className="max-h-60 overflow-y-auto p-1">
                    {flattenedOptions.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            No options found
                        </div>
                    ) : (
                        flattenedOptions.map((option, idx) => {
                            // RENDER GROUP HEADER
                            if (option.isHeader) {
                                return (
                                    <div 
                                        key={option.value} 
                                        className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 select-none"
                                    >
                                        {option.label}
                                    </div>
                                )
                            }

                            // RENDER STANDARD OPTION
                            return (
                                <div
                                    key={option.value}
                                    className={`
                                      flex items-center justify-between px-4 py-2.5 rounded-md cursor-pointer
                                      transition-all duration-150 ease-in-out
                                      ${isSelected(option) ? 'bg-red-50 text-red-700' : 'text-gray-700'}
                                      ${highlightedIndex === idx ? 'bg-gray-100' : ''}
                                      hover:bg-gray-100
                                    `}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={() => setHighlightedIndex(idx)}
                                >
                                    <span className="font-medium">{option.label}</span>
                                    {isSelected(option) && (
                                        <Check size={18} className="text-red-600" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Select;