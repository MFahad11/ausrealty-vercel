import React, { useState, useEffect, useContext, useRef } from 'react'
import axiosInstance from '@/utils/axios-instance'
import {
  Autocomplete,
  GoogleMap,
  useJsApiLoader,
  Marker
} from '@react-google-maps/api'
import Button from '../ui/Button'
import { showToast } from '../ui/toast'
import { IoSend } from 'react-icons/io5'
import { useForm } from 'react-hook-form'
import { MdOutlineEdit } from 'react-icons/md'
import { HiChevronDown } from 'react-icons/hi2'
import PageLoader from '../ui/PageLoader'
import GoogleMaps from '../GoogleMaps'
import Tooltip from '../ui/Tooltip'
import arrow from 'assets/images/arrow.png'
import GooglePieChart from '../GooglePieChart'
// import { AuthContext } from "context/AuthContext";
import Modal from '../ui/Modal'
import EditableField from '../ui/EditableField'
// import NoImage from 'assets/images/no-image.jpg'
import axiosExternalInstance from '@/utils/axios-external-instance'
import GoogleChart from '../GoogleChart'
import EmblaCarousel from '../ui/carousel'
import LogicalPriceEdit from '../ui/LogicalPriceEdit'
import { PropertyDetailsModal } from '../ui/PropertyDetailsModal'
import { LiaSyncSolid } from "react-icons/lia";
import { FaSpinner } from 'react-icons/fa'
import BookingOverlay from './BookApraisal/Overlay'
const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  adaptiveHeight: true,
  arrows: true,
  slidesToShow: 1, // Show only 2 slides if they are large in width
  slidesToScroll: 1,
  variableWidth: true, // Allows variable width for slides
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: false
      }
    }
  ]
}

const mapSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  adaptiveHeight: true,
  arrows: false,
  slidesToShow: 1, // Show only 2 slides if they are large in width
  slidesToScroll: 1
  // variableWidth: true, // Allows variable width for slides
}

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return 'N/A'
  return '$' + new Intl.NumberFormat().format(value)
}

const RecentAreaSoldProcess = ({
  recentAreaSoldProcess
}: {
  recentAreaSoldProcess: any[]
}) => {
  const [expandedRow, setExpandedRow] = useState(null)
//   const [filterMonths, setFilterMonths] = useState(12) // Default is 12 months
  const [suggestions, setSuggestions] = useState([]) // Store all suggestions from the API
//   const [filteredSuggestions, setFilteredSuggestions] = useState([]) // Store filtered suggestions based on user input
//   const [searchTerm, setSearchTerm] = useState('') // Search input value
//   const [showSuggestions, setShowSuggestions] = useState(false) // To toggle the visibility of the dropdown
//   const [filteredRecentAreaSoldProcess, setFilteredRecentAreaSoldProcess] =
//     useState(recentAreaSoldProcess) // Store filtered data

  const toggleRow = (index: any) => {
    setExpandedRow(expandedRow === index ? null : index) // Toggle row
  }

  // Fetch all suggestions once when the component mounts
  useEffect(() => {
    axiosInstance
      .get('/api/property/suburbName')
      .then(response => {
        const suburbData = response.data.data // Assuming the response has a `data` field containing suburbs
        setSuggestions(suburbData) // Store all suggestions
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error)
      })
  }, [])

  // Handle search term change and filter suggestions locally
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const searchValue = e.target.value
//     setSearchTerm(searchValue)

//     // Show the dropdown only when the user starts typing
//     if (searchValue.length > 0) {
//       setShowSuggestions(true)

//       // Filter suggestions based on the search term
//       const filtered = suggestions.filter((suggestion: string) =>
//         suggestion.toLowerCase().includes(searchValue.toLowerCase())
//       )
//       setFilteredSuggestions(filtered) // Update filtered suggestions based on input
//     } else {
//       setShowSuggestions(false) // Hide the dropdown if the input is empty
//     }
//   }
  const [loading, setLoading] = useState(false)
  // Handle suggestion click and call API to replace recentAreaSoldProcess
//   const handleSuggestionClick = async (suggestion: string) => {
//     try {
//       setLoading(true) // Set loading to true before making the API call
//       const response = await axiosExternalInstance.post(
//         `/property/recentAreaSoldProcess/${suggestion}/House`
//       )

//       setFilteredRecentAreaSoldProcess(response.data.data) // Replace recentAreaSoldProcess data with new data
//       setSearchTerm(suggestion) // Set the selected suggestion as the input value
//       setShowSuggestions(false) // Hide the dropdown after a suggestion is selected
//       setFilterMonths(12)
//     } catch (error) {
//       console.error('Error fetching recent area sold process:', error)
//     } finally {
//       setLoading(false) // Set loading to false once the API call is completed
//     }
//   }

  const calculateMonthsAgo = (months: number) => {
    const date = new Date()
    date.setMonth(date.getMonth() - months)
    return date
  }

//   const twelveMonthsAgo = calculateMonthsAgo(filterMonths) // Based on selected months
  const parseDate = (dateString: string) => new Date(dateString)

//   useEffect(
//     () =>
//       setFilteredRecentAreaSoldProcess(
//         filteredRecentAreaSoldProcess.filter(property => {
//           const saleDateValue =
//             property?.saleHistory?.sales?.[0]?.saleDate?.value
//           if (saleDateValue) {
//             const saleDate = parseDate(saleDateValue) // Convert string to Date object
//             return saleDate >= twelveMonthsAgo // Perform the comparison
//           }
//           return false // Exclude properties without a valid saleDate.value
//         })
//       ),
//     [filterMonths]
//   )

  return (
    <>
      
    </>
  )
}

const RegenerateLogicalPrice = ({
  property,
  regenerateLogicalPrice,
  setRegenerateLogicalPrice,
  soldProperties,
  setLogicalPrice,
  setLogicalReasoning
}: {
  property: any
  regenerateLogicalPrice: boolean
  setRegenerateLogicalPrice: any
  soldProperties: any[]
  setLogicalPrice: any
  setLogicalReasoning: any
}) => {
  const [checkedProperties, setCheckedProperties] = useState([])
  const [loading, setLoading] = useState(false)
  // Handle checkbox selection
  const handleCheckboxChange = (propertyId: string) => {
    setCheckedProperties(
      (prevChecked: any) =>
        prevChecked.includes(propertyId)
          ? prevChecked.filter((id: string) => id !== propertyId) // Uncheck
          : [...prevChecked, propertyId] // Check
    )
  }

  // Handle regenerate button click
  const handleRegenerate = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.post(
        '/api/property/regenerateLogicalPrice',
        {
          property: property,
          checkedProperties: soldProperties.filter(({ property }) =>
            // @ts-ignore
            checkedProperties.includes(property._id || property.id)
          )
        }
      )
      if (response.data.success) {
        setRegenerateLogicalPrice(false)
        setLogicalPrice(response.data.data.logicalPrice)
        setLogicalReasoning(response.data.data.logicalReasoning)
        // await axiosExternalInstance.put('/userProperty', {
        //   address: property.address,
        //   logicalPrice: response.data.data.logicalPrice,
        //   logicalReasoning: response.data.data.logicalReasoning
        // })
      }
    } catch (error: any) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={regenerateLogicalPrice}
      onClose={() => setRegenerateLogicalPrice(false)}
      title='Regenerate Logical Price'
    >
      {soldProperties && soldProperties.length > 0 && (
        <div className='w-full overflow-x-auto'>
          <table className='w-full border-collapse text-center'>
            <thead>
              <tr className='bg-lightgray'>
                <th className='py-2 px-3'>Select</th>
                <th className='py-2 px-3'>Address</th>
                <th className='py-2 px-3'>Price</th>
              </tr>
            </thead>
            <tbody>
              {soldProperties.map(({ property }, index) => (
                <tr key={property._id} className='border-b'>
                  <td className='py-2 px-3'>
                    <input
                      type='checkbox'
                      checked={checkedProperties.includes(
                        // @ts-ignore
                        property._id || property.id
                      )}
                      onChange={() =>
                        handleCheckboxChange(property._id || property.id)
                      }
                    />
                  </td>
                  <td className='py-2 px-3 flex flex-col gap-2'>
                    <img
                      src={property?.media?.[0]?.url}
                      alt='property'
                      className='w-auto h-24 sm:h-auto max-h-40'
                    ></img>
                    {property.address ||
                      property?.propertyDetails?.displayableAddress}
                  </td>
                  <td className='py-2 px-3'>
                    {property?.priceDetails?.price || property?.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='flex justify-end mt-4'>
        <Button
          onClick={handleRegenerate}
          className='black-button'
          loading={loading}
        >
          Regenerate
        </Button>
      </div>
    </Modal>
  )
}

const FinishesSelector = ({
  register,
  errors,
  selectedValue,
  onChange,
  onEdit
}: {
  register: any
  errors: any
  selectedValue: string
  onChange: any
  onEdit: any
}) => {
  const finishesData = [
    {
      label: 'High-end finishes',
      value: 'High-end finishes',
      imgSrc:
        'https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/finishesGuide/high-end.png'
    },
    {
      label: 'Updated',
      value: 'Updated',
      imgSrc:
        'https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/finishesGuide/updated.png'
    },
    {
      label: 'Original',
      value: 'Original',
      imgSrc:
        'https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/finishesGuide/original.png'
    }
  ]

  useEffect(() => {
    register('finishes', { required: 'Finishes selection is required' })
  }, [register])

  return (
    <div>
      <label className='form-label'>Select Finishes</label>
      {selectedValue ? (
        <div className='flex items-center justify-between form-input border border-mediumgray p-2'>
          <span>{selectedValue}</span>
          <button type='button' onClick={onEdit} className='text-darkergray'>
            <MdOutlineEdit />
          </button>
        </div>
      ) : (
        <div className='flex overflow-x-auto box-scrollbar gap-4'>
          {finishesData.map(finish => (
            <div
              key={finish.value}
              className='cursor-pointer rounded mr-4 transition'
              onClick={() => onChange(finish.value)}
            >
              <img
                src={finish.imgSrc}
                alt={finish.label}
                className='w-full h-auto min-w-[250px] max-h-[256px] object-cover'
              />
              <span className='block text-sm text-center mt-2'>
                {finish.label}
              </span>
            </div>
          ))}
        </div>
      )}
      {errors.finishes && (
        <span className='form-error-message'>{errors.finishes.message}</span>
      )}
    </div>
  )
}

const WaterViewsSelector = ({
  register,
  errors,
  selectedValue,
  onChange,
  onEdit
}: {
  register: any
  errors: any
  selectedValue: string
  onChange: any
  onEdit: any
}) => {
  const waterViewsData = [
    {
      label: 'Deep waterfront with jetty',
      value: 'Deep waterfront with jetty',
      imgSrc:
        'https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/waterViews/deep-waterfront-with-jetty.jpg'
    },
    {
      label: 'Water views',
      value: 'Water views',
      imgSrc:
        'https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/waterViews/water-views.jpg'
    },
    {
      label: 'Tidal waterfront with jetty',
      value: 'Tidal waterfront with jetty',
      imgSrc:
        'https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/waterViews/tidal-waterfront-with-jetty.jpg'
    },
    {
      label: 'Waterfront reserve',
      value: 'Waterfront reserve',
      imgSrc:
        'https://beleef-public.s3.ap-southeast-2.amazonaws.com/assets/waterViews/waterfront-reserve.jpg'
    }
  ]

  useEffect(() => {
    register('waterViews', { required: 'Waterviews selection is required' })
  }, [register])

  const handleNoCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    if (isChecked) {
      onChange('No')
    } else {
      onChange('')
    }
  }

  return (
    <div>
      <label className='form-label'>Select Water Aspect</label>

      {/* Display selected value with Edit button if a selection is made */}
      {selectedValue ? (
        <div className='flex items-center justify-between form-input border border-mediumgray p-2'>
          <span>{selectedValue}</span>
          <button type='button' onClick={onEdit} className='text-darkergray'>
            <MdOutlineEdit />
          </button>
        </div>
      ) : (
        // Display options when no selection is made
        <>
          {/* "No" Checkbox */}
          <label className='flex items-center mb-2'>
            <input
              type='checkbox'
              checked={selectedValue === 'No'}
              onChange={handleNoCheckboxChange}
              className='mr-2'
            />
            No
          </label>

          {/* Display options if "No" is not selected */}
          {selectedValue !== 'No' && (
            <div className='flex overflow-x-auto box-scrollbar gap-4'>
              {waterViewsData.map(waterView => (
                <div
                  key={waterView.value}
                  className='cursor-pointer rounded mr-4 transition'
                  onClick={() => onChange(waterView.value)}
                >
                  <img
                    src={waterView.imgSrc}
                    alt={waterView.label}
                    className='w-full h-auto min-w-[250px] max-h-[256px] object-cover'
                  />
                  <span className='block text-sm text-center mt-2'>
                    {waterView.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Display errors if any */}
      {errors.waterViews && (
        <span className='form-error-message'>{errors.waterViews.message}</span>
      )}
    </div>
  )
}

const TopographyDropdown = ({
  selectedValues = [], // Ensure selectedValues is an array
  onToggleOption,
  isOpen,
  toggleDropdown,
  errors,
  register,
  trigger // add trigger to manually validate
}: {
  selectedValues?: string[]
  onToggleOption: any
  isOpen: boolean
  toggleDropdown: any
  errors: any
  register: any
  trigger: any
}) => {
  const dropdownRef = useRef(null)

  // useEffect(() => {
  //   register("topography", {
  //     validate: (value) =>
  //       value.length > 0 || "At least one option must be selected",
  //   });
  // }, [register]);

  useEffect(() => {
    register('topography', {
      validate: (value: string) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one option must be selected' // Error if no selection
        }
        return true // No error if validation passes
      }
    })
  }, [register])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // @ts-ignore
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleDropdown(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, toggleDropdown])

  const handleToggleOption = (option: string) => {
    onToggleOption(option)
    trigger('topography') // Trigger validation after toggling an option
  }

  return (
    <div ref={dropdownRef} className='relative'>
      <div
        className='flex items-center justify-between form-select p-2 border border-mediumgray cursor-pointer'
        onClick={() => toggleDropdown(!isOpen)}
      >
        <div className='truncate'>
          {selectedValues?.length > 0
            ? selectedValues.join(', ')
            : 'Select options...'}
        </div>

        <HiChevronDown />
      </div>
      {isOpen && (
        <div className='absolute z-10 w-full bg-white border border-mediumgray'>
          {[
            'High side',
            'Level block',
            'Low side',
            'Irregular block',
            'Unusable land'
          ].map(option => (
            <div
              key={option}
              className='flex items-center text-xs p-2 cursor-pointer hover:bg-lightgray'
              onClick={() => handleToggleOption(option)}
            >
              <input
                type='checkbox'
                checked={selectedValues?.includes(option) || false}
                readOnly
                className='mr-2'
              />

              {option}
            </div>
          ))}
        </div>
      )}
      {errors.topography && (
        <span className='form-error-message'>{errors.topography.message}</span>
      )}
    </div>
  )
}

const PropertyForm = ({
  property,
  onSubmitForm
}: {
  property: any
  onSubmitForm: any
}) => {
  const { address, waterViews } = property || {}
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(property)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset
  } = useForm({
    defaultValues: formData,
    // Ensure that fields are not unregistered when they are removed from the UI
    shouldUnregister: false
  })

  useEffect(() => {
    setFormData(property)
    reset(property) // Reset form with new property data
  }, [property, reset])

  const [editMode, setEditMode] = useState(false)
  const [topographyOpen, setTopographyOpen] = useState(false)

  const selectedFinish = watch('finishes')
  const selectedWaterView = watch('waterViews')
  const selectedTopography = watch('topography')
  const propertyType = watch('propertyType') // Watch propertyType
  const medianPrice = watch('medianPrice')

  const onSubmit = (data: any) => {
    const updatedData = { ...formData, ...data }

    setFormData(updatedData)

    onSubmitForm(updatedData)
  }

  const handleSelectFinish = (value: string) => {
    setValue('finishes', value)
    trigger('finishes') // Trigger validation after setting the value
    setEditMode(false)
  }

  const handleEditFinish = () => {
    setEditMode(true)
    setValue('finishes', '') // Clear the value when editing
    trigger('finishes') // Trigger validation after setting the value
  }

  const handleSelectWaterView = (value: string) => {
    setValue('waterViews', value)
    trigger('waterViews') // Trigger validation after setting the value
    setEditMode(false)
  }

  const handleEditWaterView = () => {
    setEditMode(true)
    setValue('waterViews', '') // Clear the value when editing
    trigger('waterViews') // Trigger validation after setting the value
  }

  const handleToggleTopographyOption = (option: string) => {
    let newSelectedTopography = [...(selectedTopography || [])]
    if (option === 'High side') {
      if (selectedTopography?.includes('Low side')) {
        // Remove "Low side" if "High side" is selected
        newSelectedTopography = selectedTopography.filter(
          (item: string) => item !== 'Low side'
        )
      }
    } else if (option === 'Low side') {
      if (selectedTopography?.includes('High side')) {
        // Remove "High side" if "Low side" is selected
        newSelectedTopography = selectedTopography.filter(
          (item: string) => item !== 'High side'
        )
      }
    }

    // Toggle the current option
    if (newSelectedTopography?.includes(option)) {
      newSelectedTopography = newSelectedTopography.filter(
        item => item !== option
      )
    } else {
      newSelectedTopography.push(option)
    }

    setValue('topography', newSelectedTopography)
    trigger('topography') // Trigger validation after changing value
  }

  const toggleTopographyDropdown = () => {
    setTopographyOpen(!topographyOpen)
  }

  const [aiLoading, setAILoading] = useState(false)
  useEffect(() => {
    // AI Scan Function
    const aiScan = async () => {
      if (!property.autoFillAI) {
        try {
          setAILoading(true)

          // Call the AI Cleanup API
          const response = await axiosInstance.post(
            '/api/property/aiCleanup',
            {
              address: property.address
            }
          )

          // Extract data from the response
          const result = response.data?.data || {}

          // Update only the fields that are present in the AI response
          Object.keys(result).forEach(key => {
            if (result[key] !== null && result[key] !== undefined) {
              setValue(key, result[key]) // Update the field in the form
            }
          })

          // Update the local property state with the new data
          setFormData((prev: any) => ({ ...prev, ...result }))
        } catch (error: any) {
          console.error('Error during AI cleanup:', error.message)
        } finally {
          setAILoading(false)
        }
      }
    }

    aiScan()
  }, [property, setValue, setFormData]) // Add dependencies appropriately

  const debounceRef = useRef(null)
  const lastFetchedParams = useRef({
    suburb: property?.suburb || null,
    postcode: property?.postcode || null,
    propertyType:
      property?.propertyType === 'ApartmentUnitFlat'
        ? 'unit'
        : property?.propertyType
        ? 'house'
        : null,
    bedrooms: property?.bedrooms || null
  }) // Store the last parameters used for the API call

  useEffect(() => {
    const fetchMedianPrice = async () => {
      try {
        const suburb = watch('suburb')
        const postcode = watch('postcode')
        const propertyType =
          watch('propertyType') === 'ApartmentUnitFlat' ? 'unit' : 'house'
        const bedrooms = watch('bedrooms')

        // Check if required fields are missing
        if (!suburb || !postcode || !propertyType || bedrooms == null) {
          return // Avoid API calls if any required field is missing
        }

        // Check if the current parameters are the same as the last fetched ones
        const currentParams = { suburb, postcode, propertyType, bedrooms }
        const paramsUnchanged = Object.keys(currentParams).every(
          // @ts-ignore
          key => currentParams[key] === lastFetchedParams.current[key]
        )

        if (paramsUnchanged) {
          return // Skip API call if parameters are unchanged
        }

        // Update last fetched parameters
        lastFetchedParams.current = currentParams

        // Make the API call
        const response = await axiosInstance.get(
          '/api/property/getSuburbMedianPrice',
          {
            params: currentParams
          }
        )

        if (response.data.success) {
          setValue('medianPrice', response.data.data.medianPrice) // Update medianPrice
          setValue('medianPriceSource', response.data.data.medianPriceSource) // Update medianPrice
        }
      } catch (error) {
        console.error('Error fetching median price:', error)
      }
    }

    // Debounce API calls to prevent excessive requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    // @ts-ignore
    debounceRef.current = setTimeout(() => {
      fetchMedianPrice()
    }, 2000) // Debounce delay: 2000ms
  }, [
    watch('suburb'),
    watch('postcode'),
    watch('propertyType'),
    watch('bedrooms')
  ])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
      <div className='space-y-4'>
        {property.domainPrice &&
          property.domainPrice.lowerPrice !== undefined &&
          property.domainPrice.upperPrice !== undefined && (
            <div className='flex flex-col items-center justify-center'>
              <h4>Domain Price</h4>
              <h4>
                {formatCurrency(property.domainPrice.lowerPrice)} -{' '}
                {formatCurrency(property.domainPrice.upperPrice)}
              </h4>
              
            </div>
          )}

<h4>
        Does this look right?
        </h4>
        

        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-12 sm:col-span-6'>
            <label className='form-label'>Property Address</label>
            <input
              type='text'
              className={`form-input border ${
                errors.propertyAddress ? 'border-red-500' : 'border-mediumgray'
              }`}
              {...register('propertyAddress', {
                required: false
              })}
              value={address}
              disabled
              readOnly
            />
            {errors.propertyAddress && (
              <span className='form-error-message'>
                {/* 
                @ts-ignore
                */}
                {errors.propertyAddress?.message?.toString()}
              </span>
            )}
          </div>

          <div className='col-span-12 sm:col-span-6 relative'>
            <label className='form-label'>Property Type</label>
            <select
              className={`form-select border ${
                errors.propertyType ? 'border-red-500' : 'border-mediumgray'
              }`}
              {...register('propertyType', {
                required: 'Property Type is required'
              })}
            >
              <option value=''>Select Property Type</option>
              {[
                'ApartmentUnitFlat',
                'Duplex',
                'House',
                'Terrace',
                'Townhouse',
                'VacantLand',
                'Villa'
              ].map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.propertyType && (
              <span className='form-error-message'>
                {errors.propertyType?.message?.toString()}
              </span>
            )}
          </div>

          {property?.features && property?.features.length > 0 && (
            <div className='col-span-12'>
              <label className='form-label'>Property Features</label>
              {property?.features && property.features.join(', ')}
            </div>
          )}

          {/* Conditionally render Land Area and Frontage */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <>
              <div className='col-span-6'>
                <label className='form-label'>Land Area</label>
                <input
                  type='number'
                  step='any'
                  className={`form-input border ${
                    errors.landArea ? 'border-red-500' : 'border-mediumgray'
                  }`}
                  {...register('landArea', {
                    required:
                      propertyType !== 'ApartmentUnitFlat'
                        ? 'Land Area is required'
                        : false
                  })}
                />
                {errors.landArea && (
                  <span className='form-error-message'>
                    {errors.landArea.message?.toString()}
                  </span>
                )}
              </div>

              <div className='col-span-6'>
                <label className='form-label'>Frontage</label>
                <input
                  type='number'
                  step='any' // Allows decimal values
                  className='form-input border border-mediumgray'
                  {...register('frontage', {
                    required: false
                  })}
                />
              </div>
            </>
          )}

          <div className='col-span-12 relative'>
            <label className='form-label'>
              Median Price{' '}
              <span className='italic font-light text-xs'>
                *{property?.medianPriceSource}
              </span>
            </label>
            <input
              type='number'
              className={`form-input border ${
                errors.medianPrice ? 'border-red-500' : 'border-mediumgray'
              }`}
              {...register('medianPrice', {
                required: 'Median price is required'
              })}
              value={medianPrice}
            />
            {errors.medianPrice && (
              <span className='form-error-message'>
                {errors.medianPrice?.message?.toString()}
              </span>
            )}
          </div>

          <div className='col-span-6 sm:col-span-4'>
            <label className='form-label'>Bedrooms</label>
            <input
              type='number'
              className={`form-input border ${
                errors.bedrooms ? 'border-red-500' : 'border-mediumgray'
              }`}
              {...register('bedrooms', {
                required: 'Number of Beds is required'
              })}
              min={0}
            />
            {errors.bedrooms && (
              <span className='form-error-message'>
                {errors.bedrooms?.message?.toString()}
              </span>
            )}
          </div>

          <div className='col-span-6 sm:col-span-4'>
            <label className='form-label'>Bathrooms</label>
            <input
              type='number'
              className={`form-input border ${
                errors.bathrooms ? 'border-red-500' : 'border-mediumgray'
              }`}
              {...register('bathrooms', {
                required: 'Number of Baths is required'
              })}
              min={0}
            />
            {errors.bathrooms && (
              <span className='form-error-message'>
                {errors.bathrooms?.message?.toString()}
              </span>
            )}
          </div>

          <div className='col-span-6 sm:col-span-4'>
            <label className='form-label'>Car Spaces</label>
            <input
              type='number'
              className={`form-input border ${
                errors.carspaces ? 'border-red-500' : 'border-mediumgray'
              }`}
              {...register('carspaces', {
                required: 'Number of Car Spaces is required'
              })}
              min={0}
            />
            {errors.carspaces && (
              <span className='form-error-message'>
                {errors.carspaces?.message?.toString()}
              </span>
            )}
          </div>

          <div className='col-span-12'>
            <FinishesSelector
              register={register}
              errors={errors}
              selectedValue={editMode ? null : selectedFinish}
              onChange={handleSelectFinish}
              onEdit={handleEditFinish}
            />
          </div>

          <div className='col-span-12'>
            <WaterViewsSelector
              register={register}
              errors={errors}
              selectedValue={editMode ? null : selectedWaterView}
              onChange={handleSelectWaterView}
              onEdit={handleEditWaterView}
            />
          </div>

          {/* Conditionally render Topography */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-12'>
              <label className='form-label'>Topography</label>
              <TopographyDropdown
                selectedValues={selectedTopography}
                onToggleOption={handleToggleTopographyOption}
                isOpen={topographyOpen}
                toggleDropdown={toggleTopographyDropdown}
                errors={errors}
                register={register}
                trigger={trigger}
              />
            </div>
          )}

          {/* Conditionally render Build Construction Type */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-6'>
              <label className='form-label'>Build Construction Type</label>
              <select
                className={`form-input border ${
                  errors.buildType ? 'border-red-500' : 'border-mediumgray'
                }`}
                {...register('buildType', {
                  required:
                    propertyType !== 'ApartmentUnitFlat'
                      ? 'Build Construction Type is required'
                      : false
                })}
              >
                <option value=''>Select Construction Type</option>
                <option value='1 storey'>1 storey</option>
                <option value='2 storey'>2 storey</option>
                <option value='3 storey'>3 storey</option>
                <option value='4+ storey'>4+ storey</option>
              </select>
              {errors.buildType && (
                <span className='form-error-message'>
                  {errors.buildType?.message?.toString()}
                </span>
              )}
            </div>
          )}

          {/* Conditionally render Granny Flat */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-6'>
              <label className='form-label'>Granny Flat</label>
              <select
                className={`form-select border ${
                  errors.grannyFlat ? 'border-red-500' : 'border-mediumgray'
                }`}
                {...register('grannyFlat', {
                  required:
                    propertyType !== 'ApartmentUnitFlat'
                      ? 'Granny Flat selection is required'
                      : false
                })}
              >
                <option value=''>Select Granny Flat</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
              {errors.grannyFlat && (
                <span className='form-error-message'>
                  {errors.grannyFlat?.message?.toString()}
                </span>
              )}
            </div>
          )}

          {/* Conditionally render Wall Material */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-6'>
              <label className='form-label'>Wall Material</label>
              <select
                className={`form-input border ${
                  errors.wallMaterial ? 'border-red-500' : 'border-mediumgray'
                }`}
                {...register('wallMaterial', {
                  required:
                    propertyType !== 'ApartmentUnitFlat'
                      ? 'Wall Material is required'
                      : false
                })}
              >
                <option value=''>Select Wall Material</option>
                <option value='Brick'>Brick</option>
                <option value='Double brick'>Double brick</option>
                <option value='Clad'>Clad</option>
                <option value='Fibro'>Fibro</option>
                <option value='Hebel'>Hebel</option>
              </select>
              {errors.wallMaterial && (
                <span className='form-error-message'>
                  {errors.wallMaterial?.message?.toString()}
                </span>
              )}
            </div>
          )}

          {/* Conditionally render Pool */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-6'>
              <label className='form-label'>Pool</label>
              <select
                className={`form-select border ${
                  errors.pool ? 'border-red-500' : 'border-mediumgray'
                }`}
                {...register('pool', {
                  required:
                    propertyType !== 'ApartmentUnitFlat'
                      ? 'Pool selection is required'
                      : false
                })}
              >
                <option value=''>Select Pool</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
              {errors.pool && (
                <span className='form-error-message'>
                  {errors.pool?.message?.toString()}
                </span>
              )}
            </div>
          )}

          {/* Conditionally render Tennis Court */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-6'>
              <label className='form-label'>Tennis Court</label>
              <select
                className={`form-select border ${
                  errors.tennisCourt ? 'border-red-500' : 'border-mediumgray'
                }`}
                {...register('tennisCourt', {
                  required:
                    propertyType !== 'ApartmentUnitFlat'
                      ? 'Tennis Court selection is required'
                      : false
                })}
              >
                <option value=''>Select Tennis Court</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
              {errors.tennisCourt && (
                <span className='form-error-message'>
                  {errors.tennisCourt?.message?.toString()}
                </span>
              )}
            </div>
          )}

          {/* Conditionally render Street Traffic */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-6'>
              <label className='form-label'>Street Traffic</label>
              <select
                className={`form-select border ${
                  errors.streetTraffic ? 'border-red-500' : 'border-mediumgray'
                }`}
                {...register('streetTraffic', {
                  required:
                    propertyType !== 'ApartmentUnitFlat'
                      ? 'Street Traffic selection is required'
                      : false
                })}
              >
                <option value=''>Select Street Traffic</option>
                <option value='Low traffic'>Low traffic</option>
                <option value='Moderate traffic'>Moderate traffic</option>
                <option value='High traffic'>High traffic</option>
              </select>
              {errors.streetTraffic && (
                <span className='form-error-message'>
                  {errors.streetTraffic?.message?.toString()}
                </span>
              )}
            </div>
          )}

          {/* Conditionally render Development Potential */}
          {propertyType !== 'ApartmentUnitFlat' && (
            <div className='col-span-12 sm:col-span-6'>
              <label className='form-label'>Development Potential</label>
              <select
                className={`form-select border ${
                  errors.developmentPotential
                    ? 'border-red-500'
                    : 'border-mediumgray'
                }`}
                {...register('developmentPotential')}
              >
                <option value=''>Select Development Potential</option>
                <option value='Childcare'>Childcare</option>
                <option value='Duplex site'>Duplex site</option>
                <option value='Townhouse site'>Townhouse site</option>
                <option value='Unit site'>Unit site</option>
              </select>
              {errors.developmentPotential && (
                <span className='form-error-message'>
                  {errors.developmentPotential?.message?.toString()}
                </span>
              )}
            </div>
          )}

          <div className='col-span-12 sm:col-span-6'>
            <label className='form-label'>Additional Information</label>
            <textarea
              className={`form-textarea border ${
                errors.additionalInformation
                  ? 'border-red-500'
                  : 'border-mediumgray'
              }`}
              {...register('additionalInformation')}
              rows={3}
            />
          </div>
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            type='submit'
            className='black-button'
            onClick={() => setStep(2)}
          >
            Next
          </Button>
        </div>
      </div>
    </form>
  )
}

const PropertyResult = ({
  property,
  onEdit,
  setPropertyForm,
  setQuickSearch
}: {
  property: any
  onEdit: any
  setPropertyForm: any,
  setQuickSearch: any,
}) => {
  const [loading, setLoading] = useState(false)

  // const { user } = useContext(AuthContext);
  // const { name, email, picture } = user || {};

  const [logicalPrice, setLogicalPrice] = useState(null)
  const [saleProperties, setSaleProperties] = useState([])
  const [soldProperties, setSoldProperties] = useState<
    Array<{
      property: any
      price: number
    }>
  >([])
  const [areaDynamics, setAreaDynamics] = useState<{
    unitSoldStats: any
    houseSoldStats: any
    houseStats: any
    unitStats: any
  } | null>(null)
  const [logicalReasoning, setLogicalReasoning] = useState(null)
  const [pieChartData, setPieChartData] = useState([['Process', 'Count']])
  const [regenerateLogicalPrice, setRegenerateLogicalPrice] = useState(false)
  const [recentAreaSoldProcess, setRecentAreaSoldProcess] = useState(property?.recentAreaSoldProcess || [])

  useEffect(() => {
    if (!property?._id) return // Ensure property exists before making API calls

    const fetchAreaDynamics = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/property/suburb/${property.suburb}`
        )

        setAreaDynamics(response?.data?.data)

        let formattedData = [['Process', 'Count']] // Initialize with header row

        if (property.propertyType === 'ApartmentUnitFlat') {
          const unitSoldStats = response?.data?.data.unitSoldStats

          formattedData.push([
            'Private treaty adjustment',
            unitSoldStats?.numberSold
          ])
          formattedData.push(['Auction', unitSoldStats?.auctionNumberSold])
          formattedData.push([
            'Not sold at auction',
            (
              unitSoldStats?.auctionNumberAuctioned -
              unitSoldStats?.auctionNumberSold
            ).toString()
          ])
        } else {
          const houseSoldStats = response?.data?.data.houseSoldStats // Assuming correct data path

          formattedData.push([
            'Private treaty adjustment',
            houseSoldStats?.numberSold
          ])
          formattedData.push(['Auction', houseSoldStats?.auctionNumberSold])
          formattedData.push([
            'Not sold at auction',
            (
              houseSoldStats?.auctionNumberAuctioned -
              houseSoldStats?.auctionNumberSold
            ).toString()
          ])
        }

        setPieChartData(formattedData)
      } catch (error) {
        console.error('Error fetching area dynamics:', error)
      }
    }

    const fetchRecommendProperties = async () => {
      try {
        const response = await axiosInstance.post(
          '/api/property/recommend',
          {
            property // Send the whole property object in the request body
          }
        )
        console.log('Recommended Properties Response:', response)

        setLogicalPrice(response?.data?.data?.logical?.logicalPrice || null)
        setLogicalReasoning(response?.data?.data?.logical?.logicalReasoning || null)
        // setSaleProperties(response?.data?.data?.recommendedSales || [])
        // setSoldProperties(response?.data?.data?.recommendedSold || [])
      } catch (error) {
        console.error('Error fetching recommended properties:', error)
      }
    }

    const executeFetchFunctions = async () => {
      try {
        setLoading(true)
        await fetchAreaDynamics() // Waits for this to complete before moving on
        await fetchRecommendProperties() // Waits for this to complete
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false) // Executed after all functions are completed or in case of error
      }
    }

    executeFetchFunctions()

    // Only trigger the useEffect when property._id changes
  }, [property._id])

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return 'N/A'
    return '$' + new Intl.NumberFormat().format(value)
  }

  const convertDate = (dateString: string) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    // @ts-ignore
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  function getAverageValueInUnits (range: string) {
    // Remove dollar signs, commas, and split the range into two numbers
    const [low, high] = range
      .replace(/\$|,/g, '') // Remove dollar signs and commas
      .split('-') // Split by the hyphen into low and high values
      .map(str => parseFloat(str.trim())) // Trim spaces and parse as numbers

    if (isNaN(low) || isNaN(high)) {
      return 0
    }

    // Calculate the average
    const average = (low + high) / 2

    // Return the average in units format
    return average
  }

  // Create dataPoints for GoogleChart
  const dataPoints = [
    [
      property.landArea || 0,
      logicalPrice ? getAverageValueInUnits(logicalPrice) : 0,
      property.address
    ],
    ...(() => {
      // Ensure soldProperties is defined and is an array
      if (!Array.isArray(soldProperties)) return []

      return soldProperties
        .filter(
          ({ property }) =>
            (property?.landArea || property?.propertyDetails?.landArea) && // Ensure landArea exists
            (property?.price || property?.priceDetails?.price) // Ensure price exists
        )
        .map(({ property }) => [
          property?.landArea || property?.propertyDetails?.landArea || 0, // Fallback to 0 if no landArea
          property?.price || property?.priceDetails?.price || 0, // Fallback to 0 if no price
          property?.address ||
            property?.propertyDetails?.displayableAddress ||
            'Unknown Address' // Fallback to "Unknown Address"
        ])
    })()
  ]

  const [shareLoading, setShareLoading] = useState(false)

  const handleShareClick = async () => {
    try {
      setShareLoading(true)

      // Make the API request to generate the shareable link first
      const response = await axiosInstance.post('/share/quickShare', {
        property: {
          ...property,
          logicalPrice,
          logicalReasoning
        },
        saleProperties,
        soldProperties,
        areaDynamics,
        pieChartData
      })

      const shareableLink = response.data.data

      // Trigger the share dialog with the title and link
      if (navigator.share) {
        // Ensure the share call is synchronous within the user action
        navigator.share({
          title: `Quick Search Results`,
          text: `Hi,

Please find enclosed Information for the property at ${property.address}`,
          url: shareableLink
        })
      } else {
        alert(
          'Sharing is not supported in your browser. Please copy the link: ' +
            shareableLink
        )
      }
    } catch (error) {
      console.error('Error generating shareable link:', error)
    } finally {
      setShareLoading(false)
    }
  }

  const [isPropertyClicked, setIsPropertyClicked] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property)
    setIsPropertyClicked(true)
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-10'>
        <div className='w-full flex justify-end gap-2 mt-6 relative'
        >
          
          <Button className='gray-button' onClick={onEdit} disabled={loading}>
            Back
          </Button>
          
          <Button
            className='black-button'
            onClick={()=>{
              setPropertyForm(false)
              setQuickSearch(false)
            }}
            
            disabled={loading}
          >
            Close
          </Button>
        </div>

        <p>{property.address}</p>

        <div className='space-y-6'>
          {property.domainPrice &&
            property.domainPrice.lowerPrice !== undefined &&
            property.domainPrice.upperPrice !== undefined && (
              <div className='flex flex-col items-center justify-center'>
                <h4>DOMAIN PRICE</h4>
                <p>
                  {formatCurrency(property.domainPrice.lowerPrice)} -{' '}
                  {formatCurrency(property.domainPrice.upperPrice)}
                </p>
              </div>
            )}

          

          {/* Price and Info Icon */}
          <div className='flex items-center justify-center gap-4'>
            {!loading ? (
              <>
                {/* <span className='font-bold'>
                  <LogicalPriceEdit
                    value={logicalPrice ? logicalPrice : 'N/A'}
                    onSave={(newValue: any) => {
                      setLogicalPrice(newValue)
                    }}
                  />
                </span> */}
                <div className='flex flex-col items-center justify-center'>
                <h4>LOGICAL PRICE</h4>
                <LogicalPriceEdit
                    value={logicalPrice ? logicalPrice : 'N/A'}
                    onSave={(newValue: any) => {
                      setLogicalPrice(newValue)
                    }}
                  />
              </div>
                {/* <i
                  className='fas fa-sync-alt cursor-pointer'
                  onClick={() => setRegenerateLogicalPrice(true)}
                ></i> */}
                {/* <LiaSyncSolid
                  className='cursor-pointer'
                  onClick={() => setRegenerateLogicalPrice(true)}
                  /> */}
              </>
            ) : (
              <div className='flex flex-col items-center justify-center'>
                <h4>LOGICAL PRICE</h4>
                <FaSpinner className='animate-spin' />
              </div>
              
            )}
            {/* <Tooltip
              className='w-[250px]'
              text='This is just a logical estimated price, and is grounded on a comprehensive set of factors including recent local sales, property size, number of bedrooms, the topography of the land, street traffic, recent updates to the property, and various other determinants. The information is sourced from public datasets which, while extensive, might be incomplete or contain inaccuracies, so should not be solely relied upon. For a more precise and accurate estimation of price, we strongly recommend consulting with a licensed real estate agent or a registered valuer. Occasionally, we may send you updates on the property market'
              // text={<i className="fa fa-info-circle text-xs"></i>}
              tooltip='This is just a logical estimated price, and is grounded on a comprehensive set of factors including recent local sales, property size, number of bedrooms, the topography of the land, street traffic, recent updates to the property, and various other determinants. The information is sourced from public datasets which, while extensive, might be incomplete or contain inaccuracies, so should not be solely relied upon. For a more precise and accurate estimation of price, we strongly recommend consulting with a licensed real estate agent or a registered valuer. Occasionally, we may send you updates on the property market'
            /> */}
          </div>

          {/* Logical Reasoning */}
          {logicalReasoning && (
            <div className='text-start my-1 text-sm'>
              <span className='font-bold'>Reasoning:</span>{' '}
              <div
                className='font-Inter'
                dangerouslySetInnerHTML={{ __html: logicalReasoning }}
              />
            </div>
          )}

          {/* Property Details */}
          
        </div>

        

        

        {/* {soldProperties && soldProperties.length > 0 && (
          <div className='space-y-8 w-full'>
            <h4>SCORE MATCH ON MARKET</h4>
            <GoogleChart dataPoints={dataPoints} />
          </div>
        )} */}

        {/* <div className='space-y-8 w-full'>
          <h4>AREA SALES PROCESS BREAKDOWN</h4>
          <GooglePieChart data={pieChartData} />
        </div>

        {recentAreaSoldProcess && recentAreaSoldProcess.length > 0 && (
          <RecentAreaSoldProcess
            recentAreaSoldProcess={recentAreaSoldProcess}
          />
        )} */}

        <div className='w-full max-w-lg mx-auto space-y-8'>
          <h4>YOUR AREA DYNAMICS</h4>
          {areaDynamics ? (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-start border border-mediumgray border-collapse'>
                <thead>
                  <tr className='bg-mediumgray border border-mediumgray'>
                    <th className='py-2 px-3 border border-mediumgray'></th>
                    <th className='py-2 px-3 text-left border border-mediumgray'>
                      <i className='fa-solid fa-house mr-2'></i> House
                    </th>
                    <th className='py-2 px-3 text-left border border-mediumgray'>
                      <i className='fa-solid fa-building mr-2'></i> Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='border-b border-mediumgray'>
                    <td className='py-2 px-3 border border-mediumgray'>
                      Median Sale Price
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.houseStats
                        ? `$${areaDynamics.houseStats.medianSalePrice?.toLocaleString()}`
                        : 'N/A'}
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.unitStats
                        ? `$${areaDynamics.unitStats.medianSalePrice?.toLocaleString()}`
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr className='border-b border-mediumgray'>
                    <td className='py-2 px-3 border border-mediumgray'>
                      Annual Sales Volume
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.houseStats
                        ? areaDynamics.houseStats.annualSalesVolume
                        : 'N/A'}
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.unitStats
                        ? areaDynamics.unitStats.annualSalesVolume
                        : 'N/A'}
                    </td>
                  </tr>

                  <tr className='border-b border-mediumgray'>
                    <td className='py-2 px-3 border border-mediumgray'>
                      Suburb Growth
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.houseStats
                        ? areaDynamics.houseStats.suburbGrowth
                        : 'N/A'}
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.unitStats
                        ? areaDynamics.unitStats.suburbGrowth
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr className='border-b border-mediumgray'>
                    <td className='py-2 px-3 border border-mediumgray'>
                      High Demand Area
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.houseStats
                        ? areaDynamics.houseStats.highDemandArea
                        : 'N/A'}
                    </td>
                    <td className='py-2 px-3 border border-mediumgray'>
                      {areaDynamics.unitStats
                        ? areaDynamics.unitStats.highDemandArea
                        : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className='flex justify-center items-center'>
              <i className='fa-solid fa-spinner animate-spin mr-2'></i> Loading
              ...
            </div>
          )}
        </div>

        {/* <GoogleMaps lat={property.latitude} lon={property.longitude} /> */}

        <div className='space-y-4 flex flex-col'>
          {/* <img src={picture} alt="Agent" className="max-h-[400px]" /> */}
          {/* <div>
            <p>{name}</p>
            <p>{email}</p>
          </div> */}
        </div>

        <RegenerateLogicalPrice
          property={property}
          regenerateLogicalPrice={regenerateLogicalPrice}
          setRegenerateLogicalPrice={setRegenerateLogicalPrice}
          soldProperties={soldProperties}
          setLogicalPrice={setLogicalPrice}
          setLogicalReasoning={setLogicalReasoning}
        />

        <PropertyDetailsModal
          isOpen={isPropertyClicked}
          onClose={() => setIsPropertyClicked(false)}
          property={selectedProperty}
        />
      </div>
    </div>
  )
}

const PropertyContainer = ({
  property: initialProperty, setPropertyForm,setQuickSearch,address, availableAgents
}: {
  property: any,
  setPropertyForm:any,
  setQuickSearch:any,
  address:any,
  availableAgents:any
}) => {
  const [formData, setFormData] = useState(initialProperty)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  // Function to handle the form submission and pass data to PropertyResult
  const handleFormSubmit = (data: any) => {
    setFormData(data)
    setIsSubmitted(true) // This will show the PropertyResult component
  }

  // Function to go back to editing the form
  const handleEdit = () => {
    setIsSubmitted(false) // Switch back to the form
  }

  useEffect(() => {
    // Update the form data if the initial property changes
    setFormData(initialProperty)
  }, [initialProperty])
  return (
    <>
    <BookingOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} address={address} agent={null} availableAgents={availableAgents}/>
    <div className='w-full'>
      <p className='text-[16px] font-light p-0 m-0'>
        The provided information may not be fully accurate. For a more precise assessment please consult with an agent.
      </p>
      {!isSubmitted ? (
        <PropertyForm property={formData} onSubmitForm={handleFormSubmit} />
      ) : (
        <PropertyResult property={formData} onEdit={handleEdit} 
        setPropertyForm={setPropertyForm} setQuickSearch={setQuickSearch}
        />
      )}
    </div></>
    
  )
}

const QuickSearch = ({setQuickSearch,propertyForm, setPropertyForm,propertyData}:{setQuickSearch:any, propertyForm:any, setPropertyForm:any,propertyData:any}) => {
  const [property, setProperty] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const [address, setAddress] = useState('')
  const [availableAgents, setAvailableAgents] = useState([])
  const handleLoad = (
    autocompleteInstance: google.maps.places.Autocomplete
  ) => {
    // @ts-ignore

    setAutocomplete(autocompleteInstance)
  }

  const searchProperty = async (
    shortAddress: string,
    suburb?: string,
    postcode?: string,
    latitude?: number,
    longitude?: number
  ) => {
    try {
      setLoading(true)
      const response = await axiosInstance.post('/api/property', {
        address: shortAddress,
        suburb,
        postcode,
        latitude,
        longitude
      })

      if (response.data.success) {
        const property = propertyData.find((property:{
          addressParts:{
            suburb:string,
            postcode:string,
            displayAddress:string
          },
          agentInfo:{
            email:string,
            name:string
          }
        }) => {
          console.log(property.addressParts.suburb.toLowerCase(), suburb?.toLowerCase(), property.addressParts.postcode, postcode, property.addressParts.displayAddress.toLowerCase(), shortAddress.toLowerCase())
          return (
            property.addressParts.suburb.toLowerCase() == suburb?.toLowerCase() &&
            property.addressParts.postcode == postcode &&
            property.addressParts.displayAddress.toLowerCase()?.includes(shortAddress.toLowerCase())
          )
        })
        console.log(property)
        // @ts-ignore
        property?.agentInfo?.map((agent) => {
          axiosInstance.post('/api/send-email', {
            to: agent.email,
            subject: `${property.addressParts.displayAddress} has been searched`,
            text: `Hello ${agent.name}, ${property.addressParts.displayAddress} has been searched.`
          })
        })
        console.log(property?.agentInfo)
        setAvailableAgents(property?.agentInfo || [])
        return response.data.data
      }
    } catch (error: any) {
      console.error('Error fetching properties:', error)
      setError(error.message)
    } finally {
      setLoading(false)
      setPropertyForm(true)
    }
  }

  const handlePlaceChanged = async () => {
    if (autocomplete) {
      // @ts-ignore
      const place = autocomplete.getPlace()

      if (place && place.address_components) {
        const addressComponents = place.address_components

        // Extract the formatted address components
        const suburb =
          addressComponents.find(
            (component: any) =>
              component.types.includes('locality') &&
              component.types.includes('political')
          )?.short_name || ''

        const postcode =
          addressComponents.find((component: any) =>
            component.types.includes('postal_code')
          )?.long_name || ''

        const latitude = place.geometry.location.lat()
        const longitude = place.geometry.location.lng()

        let fullAddress = place.formatted_address

        // Check if the address contains 'NSW'
        if (!fullAddress.includes('NSW')) {
          showToast('error', 'Only NSW properties are allowed.')
          return
        }

        // Step 1: Remove everything after 'NSW'
        let shortAddress = fullAddress.split('NSW')[0].trim()

        // Step 2: Dynamically replace abbreviations with long form from address components
        addressComponents
          .filter((component: any) => component.types.includes('route'))
          .forEach((component: any) => {
            const longName = component.long_name
            const shortName = component.short_name

            // If the fullAddress contains the abbreviation (short name), replace it with the long name
            if (shortName && fullAddress.includes(shortName)) {
              shortAddress = shortAddress.replace(shortName, longName)
            }
          })

        // Set the final formatted address
        setAddress(fullAddress)

        // Important functionality: Add further operations like searching the property
        const response = await searchProperty(
          shortAddress,
          suburb,
          postcode,
          latitude,
          longitude
        )
setPropertyForm(true)
        setProperty(response || '')
        console.log(propertyForm)
      
      } else {
        // Logic when the input is cleared or invalid place selected
        showToast('error', 'Invalid place selected.')
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }

  const handleSend = async () => {
    if (address.trim() === '') {
      showToast('error', 'Please type or select a valid address.')
      return
    }
    if (!address.toLowerCase().includes('nsw')) {
      showToast('error', 'Only NSW properties are allowed.')
      return
    }
    //
    const response = await searchProperty(address)
    setPropertyForm(true)
    setProperty(response || '')
    
      
  }

  if (loading) {
    return (
      <div className='text-left mb-2 p-3 space-x-1 flex items-center w-full '>
                    <div className='rounded-full h-3 w-3 bg-black animate-pulse'></div>

                    <p className='animate-pulse text-[16px] font-light'>
                    We are retrieving the information for you, Please hold.
                    </p>
                  </div>
    )
  }

  if (error) {
    // return <Error />;
    return <div>Error: {error}</div>
  }

  if (propertyForm) {
    return (
      <div className='container'>
        <PropertyContainer property={property} 
        setPropertyForm={setPropertyForm}
        setQuickSearch={setQuickSearch}
        address={address}
        availableAgents={availableAgents}
        />
      </div>
    )
  }

  return (
    <div className='w-full fixed bottom-20 md:bottom-[5.8rem] left-0 right-0 px-6 pt-2.5 pb-4 z-50 bg-white'>
        <div className='w-full max-w-4xl mx-auto flex gap-2 items-end justify-center relative'>
          <Autocomplete
            onLoad={handleLoad}
            onPlaceChanged={handlePlaceChanged}
            options={{
              componentRestrictions: { country: ['au'] },
              fields: ['address_components', 'geometry', 'formatted_address'],
              types: ['geocode']
            }}
            className='w-full'
          >
            <div className='max-w-md mx-auto relative text-xs'>
              <input
                type='text'
                value={address}
                onChange={handleInputChange}
                placeholder='Enter address here'
                className='start-campaign-input w-full relative z-10 flex-grow p-2 bg-lightgray rounded-md py-3 pl-3 pr-8 outline-none focus:outline-none resize-none overflow-y-hidden'
              />
              {address && (
                <IoSend
                  onClick={handleSend}
                  className='cursor-pointer text-darkgray hover:text-darkergray text-xl absolute z-20 top-[10px] right-[10px]'
                />
              )}
            </div>
          </Autocomplete>
        </div>
      </div>
  )
}

export default QuickSearch
