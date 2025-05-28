import React, { useState } from 'react';
import { Upload, X, AlertCircle, FileImage, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { uploadFilesToCloudinary, isValidImage } from '../../api/cloudinary';
import emailjs from '@emailjs/browser';

// console.log('Firebase DB initialized:', db);
// console.log('Firebase Config Check:', 
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   apiKey: process.env.REACT_APP_API_KEY ? 'Present' : 'Missing'
// })

const LOCATIONS = ['Corporate Office', 'Capital-A', 'Spuntek', 'Packtek'];
const TICKET_STATUS = { OPEN: 'OPEN' };
emailjs.init('prVJF7JgLABtP1H_m'); 
// const MANAGER_EMAILS = {
//   'Corporate Office': 'raghava.bk@manjushreeventures.com',
//   'Capital-A': 'raghava.bk@manjushreeventures.com', 
//   'Spuntek': 'raghava.bk@manjushreeventures.com',
//   'Packtek': 'raghava.bk@manjushreeventures.com'
// };

const SubmitTicket = ({ onTicketSubmitted = () => { } }) => {
  const [formData, setFormData] = useState({
    name: '',
    emp_id: '',
    email: '',
    location: '',
    // priority: '',
    issue_desc: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.emp_id.trim()) {
      newErrors.emp_id = 'Employee ID is required';
    } else if (formData.emp_id.trim().length < 3) {
      newErrors.emp_id = 'Employee ID must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    // if (!formData.priority) {
    //   newErrors.priority = 'Priority is required';
    // }

    if (!formData.issue_desc.trim()) {
      newErrors.issue_desc = 'Issue description is required';
    } else if (formData.issue_desc.trim().length < 10) {
      newErrors.issue_desc = 'Issue description must be at least 10 characters';
    }
    // CURRENT CODE HAS ISSUES - REPLACE THIS ENTIRE BLOCK:
    if (formData.attachments.length > 0) {
      const invalidFiles = formData.attachments.filter((file) => !isValidImage(file.name));
      if (invalidFiles.length > 0) {
        newErrors.attachments = 'Only image files (jpg, jpeg, png, gif, webp) are allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  const oversizedFiles = files.filter(file => file.size > maxSize);
  
  if (oversizedFiles.length > 0) {
    const oversizedNames = oversizedFiles.map(f => f.name).join(', ');
    setErrors(prev => ({ 
      ...prev, 
      attachments: `Files too large (max 2MB): ${oversizedNames}` 
    }));
    return;
  }

  // Clear errors and add files
  if (errors.attachments) {
    setErrors(prev => ({ ...prev, attachments: '' }));
  }
  
  setFormData(prev => ({
    ...prev,
    attachments: [...prev.attachments, ...files]
  }));
};

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const generateTicketId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `IT${year}-${random}`;
  };

const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    const generatedTicketId = generateTicketId();

    // Upload images to Cloudinary if attachments exist
    let uploadedAttachments = [];
    const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes

    // Check for oversized files ONLY ONCE
    if (formData.attachments && formData.attachments.length > 0) {
      const oversizedFiles = formData.attachments.filter(file => file.size > maxFileSize);
      
      if (oversizedFiles.length > 0) {
        const oversizedFileNames = oversizedFiles.map(file => file.name).join(', ');
        setErrors(prev => ({
          ...prev,
          attachments: `Files exceed 2MB limit: ${oversizedFileNames}`
        }));
        setLoading(false);
        return;
      }

      // Upload to Cloudinary
      try {
        uploadedAttachments = await uploadFilesToCloudinary(formData.attachments);
        console.log('✅ Images uploaded to Cloudinary:', uploadedAttachments);
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload error:', cloudinaryError);
        throw new Error('Failed to upload images to Cloudinary: ' + cloudinaryError.message);
      }
    }

    // Prepare ticket data for Firebase
    const ticketData = {
      ticket_id: generatedTicketId,
      name: formData.name.trim(),
      emp_id: formData.emp_id.trim(),
      email: formData.email.trim().toLowerCase(),
      location: formData.location,
      issue_desc: formData.issue_desc.trim(),
      attachments: uploadedAttachments,
      status: TICKET_STATUS.OPEN,
      assigned_to: '',
      resolution: '',
      resolution_date: null,
      user_feedback: '',
      feedback_flag: false,
      created_date: serverTimestamp(),
      updated_date: serverTimestamp()
    };

    console.log('Attempting to save ticket to Firebase...', ticketData);

    // Save to Firebase Firestore
    const docRef = await addDoc(collection(db, 'tickets'), ticketData);
    console.log('Ticket saved with Firebase ID:', docRef.id);

    // 🚀 NEW: Send email notification to manager
    console.log('Sending email notification to manager...');
    const emailResult = await sendEmailNotification(ticketData);
    
    if (emailResult) {
      console.log('✅ Manager notification email sent successfully');
    } else {
      console.log('⚠️ Email notification failed, but ticket was created successfully');
    }

    setTicketId(generatedTicketId);
    setSubmitted(true);
    onTicketSubmitted({ ...ticketData, firebaseId: docRef.id });

  } catch (error) {
    console.error('Error submitting ticket to Firebase:', error);
    setErrors(prev => ({
      ...prev,
      submit: `Failed to submit ticket: ${error.message}`
    }));
  } finally {
    setLoading(false);
  }
};

const sendEmailNotification = async (ticketData) => {
  try {
    const managerEmail = 'manoj.c1410@gmail.com';
    
    const templateParams = {
      to_email: managerEmail,
      ticket_id: ticketData.ticket_id,
      employee_name: ticketData.name,
      employee_id: ticketData.emp_id,
      employee_email: ticketData.email,
      location: ticketData.location,
      issue_description: ticketData.issue_desc,
      status: ticketData.status,
      created_date: new Date().toLocaleString(),
      attachments_count: ticketData.attachments?.length || 0,
      // You can add more fields as needed
    };

    const result = await emailjs.send(
      'service_rpy6vpb',    // From EmailJS dashboard
      'template_9dmtrvs',   // From EmailJS dashboard  
      templateParams
    );

    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return null;
  }
};

  const handleNewTicket = () => {
    setSubmitted(false);
    setTicketId('');
    setFormData({
      name: '',
      emp_id: '',
      email: '',
      location: '',
      // priority: '', 
      issue_desc: '',
      attachments: []
    });
    setErrors({});
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-6 px-4 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 sm:px-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Ticket Submitted Successfully!</h1>
              <p className="text-green-100">Your IT support request has been received</p>
            </div>

            <div className="px-6 py-8 sm:px-8 text-center">
              <div className="mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Your Ticket ID</h3>
                  <div className="text-2xl font-mono font-bold text-green-700 bg-white px-4 py-2 rounded border">
                    {ticketId}
                  </div>
                  <p className="text-green-600 text-sm mt-2">
                    Please save this ID to track your ticket status
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">{formData.emp_id}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Status:</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Open
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleNewTicket}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 px-6 rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 font-semibold"
                >
                  Submit Another Ticket
                </button>

                <p className="text-gray-600 text-sm">
                  Our IT team will review your request and get back to you soon.
                  You can check your ticket status using your Employee ID and Ticket ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 sm:px-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-white/20 p-3 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Submit IT Support Ticket</h1>
                <p className="text-slate-100 mt-1">Get technical assistance from our support team</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-8 sm:px-8">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Submission Error</p>
                  <p className="text-red-700 text-sm mt-1">{errors.submit}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Employee ID and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.emp_id ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    value={formData.emp_id}
                    onChange={(e) => handleInputChange('emp_id', e.target.value)}
                    placeholder="EMP001"
                  />
                  {errors.emp_id && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.emp_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@company.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Location Field */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                >
                  <option value="">Select your location</option>
                  {LOCATIONS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Status */}
              {/* Priority Field - ADD THIS AFTER LOCATION */}
              {/* <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.priority ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="">Select priority level</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.priority}
                  </p>
                )}
              </div> */}

              {/* Issue Description */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg h-32 resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.issue_desc ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  value={formData.issue_desc}
                  onChange={(e) => handleInputChange('issue_desc', e.target.value)}
                  placeholder="Please describe your IT issue in detail. Include any error messages, when the issue started, and steps you've already tried..."
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.issue_desc ? (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.issue_desc}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">Minimum 10 characters required</p>
                  )}
                  <span className="text-gray-400 text-sm">
                    {formData.issue_desc.length}/500
                  </span>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Attachments <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors duration-200">
                  <div className="text-center">
                    <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          <Upload className="w-5 h-5 mr-2" />
                          Choose Images
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploadingFiles}
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, GIF up to 2MB each
                    </p>
                  </div>
                </div>

                {uploadingFiles && (
                  <div className="mt-4 flex items-center justify-center text-blue-600">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Uploading images...
                  </div>
                )}

                {errors.attachments && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.attachments}
                  </p>
                )}

                {/* Uploaded Files */}
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Images:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={file.url || URL.createObjectURL(file)}
                              alt={file.original_filename || file.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <span className="text-sm text-gray-700 truncate">
                              {file.original_filename || file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || uploadingFiles}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white py-4 px-6 rounded-lg hover:from-slate-800 hover:to-slate-900 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-3 h-5 w-5" />
                      Submitting Ticket...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Submit Ticket
                    </span>
                  )}
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitTicket;