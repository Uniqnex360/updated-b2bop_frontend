import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, EnvelopeIcon, UserIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

// Custom useDebounce hook (from your original code)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom Snackbar component (replaces @mui/material/Snackbar)
const CustomSnackbar = ({ message, open, onClose, type = "success" }) => {
  if (!open) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const icon = type === "success" ? <CheckCircleIcon className="h-5 w-5 mr-2 text-white" /> : <XCircleIcon className="h-5 w-5 mr-2 text-white" />;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`}>
        {icon}
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-100">
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

function AddNewDealer({ reloadDealers, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const manufactureUnitId = user?.manufacture_unit_id; // Retrieve manufacture_unit_id

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [emailStatus, setEmailStatus] = useState({ message: "", color: "" }); // Track email status
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for custom snackbar

  // Use debounce for email to avoid too many API calls
  const debouncedEmail = useDebounce(email, 500);

  // Check if email exists or not
  const checkEmailExistOrNot = async (email, manufactureUnitId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IP}checkEmailExistOrNot/`, {
        params: {
          email,
          manufacture_unit_id: manufactureUnitId,
        },
      });

      console.log("Email existence check is_exist value:", response.data.data.is_exist);

      if (response.data && response.data.data && response.data.data.is_exist !== undefined) {
        if (response.data.data.is_exist) {
          setEmailStatus({
            message: "Email already exists.",
            color: "text-red-600",
          });
          return true; // Email exists
        } else {
          setEmailStatus({
            message: "Email is valid.",
            color: "text-green-600",
          });
          return false; // Email does not exist
        }
      } else {
        setEmailStatus({
          message: "Error: Invalid API response.",
          color: "text-orange-500",
        });
        return false;
      }
    } catch (error) {
      console.error("Error checking email existence:", error);
      setEmailStatus({
        message: "Error validating email.",
        color: "text-orange-500",
      });
      return false;
    }
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { name: "", email: "" };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Function to fetch username from the API
  const fetchUsername = async () => {
    // Only proceed if name and email format are valid and email is confirmed valid
    if (!name.trim() || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || emailStatus.color !== "text-green-600") {
        setUsername(""); // Clear username if inputs are not ready
        return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}generateUserName/`,
        {
          params: {
            manufacture_unit_id: manufactureUnitId,
            name: name,
          },
        }
      );

      console.log("API Response:", response);
      if (response.data && response.data.data && response.data.data.username) {
        setUsername(response.data.data.username);
      } else {
        console.error("Username not found in response:", response.data);
        setUsername("Generation Failed"); // Indicate failure
      }
    } catch (error) {
      console.error("Error generating username:", error);
      setUsername("Generation Error"); // Indicate error
    }
  };

  // Function to create user
  const createUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createUser/`,
        {
          name,
          username,
          email,
          manufacture_unit_id: manufactureUnitId,
        }
      );

      console.log("User creation response:", response);
      if (response.status === 200) {
        const message =
          response.data.data?.data?.message ||
          "User created successfully and email sent!";
        setSuccessMessage(message);
        setSnackbarOpen(true); // Open custom snackbar

        reloadDealers(); // Trigger the dealer list reload

        // Clear form fields
        setName("");
        setEmail("");
        setUsername("");
        setEmailStatus({ message: "", color: "" }); // Clear email status

        onClose(); // Close the modal/dialog
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setSuccessMessage("Failed to create user. Please try again."); // Set error message
      setSnackbarOpen(true); // Open snackbar for error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ name: "", email: "" }); // Clear previous errors
    if (validateForm()) {
      // Check email validity before allowing user creation
      const emailExists = await checkEmailExistOrNot(email, manufactureUnitId);
      if (emailExists) {
        return; // Do not proceed if email exists
      }
      createUser();
    }
  };

  // Effect to trigger username generation when debouncedEmail or name changes
  useEffect(() => {
    if (debouncedEmail && name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail) && emailStatus.color === "text-green-600") {
      fetchUsername();
    } else {
        setUsername(""); // Clear username if conditions are not met
    }
  }, [debouncedEmail, name, emailStatus.color]);


  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-6 font-inter border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Add New Dealer</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              className={`mt-1 block w-full pl-10 pr-3 py-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Dealer Name"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              className={`mt-1 block w-full pl-10 pr-3 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={email}
              onChange={async (e) => {
                const emailValue = e.target.value;
                setEmail(emailValue);
                setErrors((prev) => ({ ...prev, email: "" }));
                setEmailStatus({ message: "", color: "" }); // Reset status

                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailPattern.test(emailValue)) {
                  await checkEmailExistOrNot(emailValue, manufactureUnitId);
                } else if (emailValue.trim() !== "") { // Only show error if user typed something
                    setEmailStatus({
                      message: "Invalid email format.",
                      color: "text-red-600",
                    });
                }
              }}
              placeholder="dealer@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          {emailStatus.message && (emailStatus.color === "text-green-600" || emailStatus.color === "text-red-600") && (
            <p className={`mt-1 text-xs ${emailStatus.color}`}>{emailStatus.message}</p>
          )}
           {emailStatus.message && emailStatus.color === "text-orange-500" && (
            <p className={`mt-1 text-xs ${emailStatus.color}`}>{emailStatus.message}</p>
          )}
        </div>

        {/* Username Input with Regenerate Button */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed sm:text-sm"
              value={username}
              readOnly // Makes the field non-editable
              placeholder="Auto-generated Username"
            />
            <button
              type="button"
              onClick={fetchUsername}
              className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0"
              title="Regenerate Username"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Username is auto-generated.
          </p>
        </div>

        {/* Create User Button */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Create New User
          </button>
        </div>
      </form>

      {/* Snackbar for success/error messages */}
      <CustomSnackbar
        message={successMessage}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        type={successMessage.includes("successfully") ? "success" : "error"}
      />
    </div>
  );
}

export default AddNewDealer;
