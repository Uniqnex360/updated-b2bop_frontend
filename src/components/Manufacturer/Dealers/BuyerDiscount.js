import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Autocomplete,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";

const tabLabels = ["Product-wise", "Category-wise", "Brand-wise", "Order-level"];

const StyledCard = styled(Card)({
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  marginBottom: 24,
});
const StyledButton = styled(Button)({
  background: "#1976d2",
  color: "#fff",
  fontWeight: 600,
  "&:hover": {
    background: "#1565c0",
  },
});

export default function BuyerDiscount({ user: userProp, buyerId }) {
  let user = userProp;
  if (!user) {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch {
        user = null;
      }
    }
  }

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [level1Categories, setLevel1Categories] = useState([]);
  const [endLevelCategories, setEndLevelCategories] = useState([]);

  const [productLoading, setProductLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productPage] = useState(1);
  const [brandPage] = useState(1);
  const [categoryPage] = useState(1);

  const [tab, setTab] = useState(0);
  const [formState, setFormState] = useState({
    selectedProduct: null,
    qty: "",
    selectedLevel1: null,
    selectedEndLevel: null,
    selectedBrand: null,
    orderLevelValue: "",
    discountValue: "",
    discountType: "%",
  });
  const {
    selectedProduct,
    qty,
    selectedLevel1,
    selectedEndLevel,
    selectedBrand,
    orderLevelValue,
    discountValue,
    discountType,
  } = formState;

  const [message, setMessage] = useState({ text: "", type: "success" });
  const [discounts, setDiscounts] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);

  // Fetch paginated products
  useEffect(() => {
    if (!user?.manufacture_unit_id) return;
    setProductLoading(true);
    let url = `${process.env.REACT_APP_IP}buyerDiscount_Product?manufacture_unit_id=${user.manufacture_unit_id}&page=${productPage}&limit=20`;
    if (productSearchQuery) {
      url += `&search=${encodeURIComponent(productSearchQuery)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && Array.isArray(data.products)) {
          setProducts(
            data.products.map((p) => ({ id: p._id, product_name: p.name }))
          );
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setProductLoading(false));
  }, [user?.manufacture_unit_id, productSearchQuery, productPage]);

  // Fetch paginated brands
  useEffect(() => {
    if (!user?.manufacture_unit_id) return;
    setBrandLoading(true);
    const url = `${process.env.REACT_APP_IP}buyerDiscount_brands_list?manufacture_unit_id=${user.manufacture_unit_id}&page=${brandPage}&limit=20`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && Array.isArray(data.brands)) {
          setBrands(data.brands.map((b) => ({ id: b._id, name: b.name })));
        } else {
          setBrands([]);
        }
      })
      .catch(() => setBrands([]))
      .finally(() => setBrandLoading(false));
  }, [user?.manufacture_unit_id, brandPage]);

  // Fetch paginated categories
  useEffect(() => {
    if (!user?.manufacture_unit_id) return;
    setCategoryLoading(true);
    const url = `${process.env.REACT_APP_IP}buyerDiscount_categories_list?manufacture_unit_id=${user.manufacture_unit_id}&page=${categoryPage}&limit=20`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && Array.isArray(data.categories)) {
          const l1s = [...new Set(data.categories.map((c) => c.level1))].map(
            (l) => ({ label: l })
          );
          const els = [...new Set(data.categories.map((c) => c.endLevel))].map(
            (e) => ({ label: e })
          );
          setLevel1Categories(l1s);
          setEndLevelCategories(els);
        } else {
          setLevel1Categories([]);
          setEndLevelCategories([]);
        }
      })
      .catch(() => {
        setLevel1Categories([]);
        setEndLevelCategories([]);
      })
      .finally(() => setCategoryLoading(false));
  }, [user?.manufacture_unit_id, categoryPage]);

  // Fetch discounts from backend
  useEffect(() => {
    if (!buyerId) return;
    setLoadingDiscounts(true);
    fetch(`${process.env.REACT_APP_IP}get_discounts/?buyer_id=${buyerId}`)
      .then((res) => res.json())
      .then((data) => setDiscounts(data.discounts || []))
      .catch(() => setDiscounts([]))
      .finally(() => setLoadingDiscounts(false));
  }, [buyerId]);

  // Form validation
  const isFormValid = useMemo(() => {
    switch (tab) {
      case 0:
        return !!selectedProduct && qty > 0 && !!discountValue;
      case 1:
        return !!selectedLevel1 && !!selectedEndLevel && !!discountValue;
      case 2:
        return !!selectedBrand && !!discountValue;
      case 3:
        return !!orderLevelValue && !!discountValue;
      default:
        return false;
    }
  }, [
    tab,
    selectedProduct,
    qty,
    selectedLevel1,
    selectedEndLevel,
    selectedBrand,
    orderLevelValue,
    discountValue,
  ]);

  // Add discount to backend
  const handleAdd = useCallback(() => {
    if (!isFormValid) {
      setMessage({ text: "Please fill all required fields.", type: "error" });
      return;
    }
    if (!user?.manufacture_unit_id) {
      setMessage({ text: "Manufacturer info missing.", type: "error" });
      return;
    }

    let payload = {
      manufacture_unit_id: user.manufacture_unit_id, // 👈 add manufacturer
      buyer_id: buyerId,
      type: tabLabels[tab].replace("-wise", "").replace("Order-level", "Order"),
      discount_value: Number(discountValue),
      discount_type: discountType,
    };

    if (tab === 0) {
      payload.product_id = selectedProduct?.id;
      payload.min_quantity = Number(qty);
    }
    if (tab === 1) {
      payload.category_level1_name = selectedLevel1?.label;
      payload.category_end_name = selectedEndLevel?.label;
    }
    if (tab === 2) {
      payload.brand_id = selectedBrand?.id;
    }
    if (tab === 3) {
      payload.min_order_value = Number(orderLevelValue);
    }

    fetch(`${process.env.REACT_APP_IP}add_discount/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.discount) {
          setDiscounts((prev) => [...prev, data.discount]);
          setFormState({
            selectedProduct: null,
            qty: "",
            selectedLevel1: null,
            selectedEndLevel: null,
            selectedBrand: null,
            orderLevelValue: "",
            discountValue: "",
            discountType: "%",
          });
          setMessage({ text: "Discount added successfully.", type: "success" });
        } else {
          setMessage({ text: data.error || "Failed to add discount.", type: "error" });
        }
      })
      .catch(() => setMessage({ text: "Failed to add discount.", type: "error" }));
  }, [
    isFormValid,
    buyerId,
    tab,
    selectedProduct,
    qty,
    selectedLevel1,
    selectedEndLevel,
    selectedBrand,
    orderLevelValue,
    discountValue,
    discountType,
    user?.manufacture_unit_id,
  ]);

  // Remove discount
  const handleRemove = useCallback(
    (discountId) => {
      fetch(`${process.env.REACT_APP_IP}delete_discount/${discountId}/`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Discount deleted") {
            setDiscounts((prev) => prev.filter((d) => d._id !== discountId));
            setMessage({ text: "Discount removed.", type: "success" });
          } else {
            setMessage({ text: data.error || "Failed to remove discount.", type: "error" });
          }
        })
        .catch(() => setMessage({ text: "Failed to remove discount.", type: "error" }));
    },
    []
  );

  const renderFormFields = () => {
    switch (tab) {
      case 0:
        return (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => option.product_name || ""}
              onChange={(_, newValue) =>
                setFormState((prev) => ({ ...prev, selectedProduct: newValue }))
              }
              onInputChange={(_, newInputValue) => setProductSearchQuery(newInputValue)}
              value={selectedProduct}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              sx={{ width: { xs: "100%", sm: 300 } }}
              loading={productLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Product"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {productLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Tooltip title={option.product_name} arrow>
                  <Box component="li" {...props}>
                    <Typography variant="body2">{option.product_name}</Typography>
                  </Box>
                </Tooltip>
              )}
            />
            <TextField
              label="Min Qty"
              size="small"
              sx={{ width: { xs: "100%", sm: 120 } }}
              value={qty}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, qty: e.target.value.replace(/\D/, "") }))
              }
              type="number"
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Autocomplete
              options={level1Categories}
              getOptionLabel={(option) => option.label || ""}
              value={selectedLevel1}
              onChange={(_, newValue) => setFormState((prev) => ({ ...prev, selectedLevel1: newValue }))}
              sx={{ width: { xs: "100%", sm: 180 } }}
              loading={categoryLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Level 1 Category"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {categoryLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <Autocomplete
              options={endLevelCategories}
              getOptionLabel={(option) => option.label || ""}
              value={selectedEndLevel}
              onChange={(_, newValue) => setFormState((prev) => ({ ...prev, selectedEndLevel: newValue }))}
              sx={{ width: { xs: "100%", sm: 180 } }}
              loading={categoryLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="End Level Category"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {categoryLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>
        );
      case 2:
        return (
          <Autocomplete
            options={brands}
            getOptionLabel={(option) => option.name || ""}
            onChange={(_, newValue) => setFormState((prev) => ({ ...prev, selectedBrand: newValue }))}
            value={selectedBrand}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            sx={{ width: { xs: "100%", sm: 300 }, mb: 1 }}
            loading={brandLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Brand"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {brandLoading && <CircularProgress color="inherit" size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        );
      case 3:
        return (
          <TextField
            label="Min Order Value"
            size="small"
            sx={{ width: { xs: "100%", sm: 180 }, mb: 1 }}
            value={orderLevelValue}
            onChange={(e) => setFormState((prev) => ({ ...prev, orderLevelValue: e.target.value.replace(/[^0-9.]/, "") }))}
            type="number"
          />
        );
      default:
        return null;
    }
  };

  const hasError = message?.type === "error";
  if (hasError && (message?.text.includes("User") || message?.text.includes("Buyer"))) {
    return (
      <Box sx={{ background: "#f8fafc", minHeight: "60vh", p: { xs: 2, sm: 3, md: 4 }, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Alert severity="error" sx={{ fontSize: 18, fontWeight: 500 }}>{message.text}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#f8fafc", minHeight: "100vh", p: 3 }}>
      <StyledCard>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": { background: "#22223b", height: 3 },
            "& .MuiTab-root": { fontWeight: 500, fontSize: 15, color: "#22223b" },
            "& .Mui-selected": { color: "#22223b !important" },
          }}
        >
          {tabLabels.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{tabLabels[tab]} Discount</Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
            {renderFormFields()}

            <TextField
              label="Enter Discount"
              size="small"
              sx={{ width: { xs: "100%", sm: 120 } }}
              value={discountValue}
              onChange={(e) => setFormState((prev) => ({ ...prev, discountValue: e.target.value.replace(/[^0-9.]/, "") }))}
              InputProps={{
                startAdornment: discountType === "$" ? <InputAdornment position="start">₹</InputAdornment> : null,
                endAdornment: discountType === "%" ? <InputAdornment position="end">%</InputAdornment> : null,
              }}
            />

            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={discountType}
                onChange={(e) => setFormState((prev) => ({ ...prev, discountType: e.target.value }))}
                sx={{ fontSize: "14px" }}
              >
                <MenuItem value="%">%</MenuItem>
                <MenuItem value="$">$</MenuItem>
              </Select>
            </FormControl>
            <StyledButton variant="contained" onClick={handleAdd} disabled={!isFormValid} sx={{ alignSelf: "center" }}>
              Add
            </StyledButton>
          </Box>
        </CardContent>
      </StyledCard>

      {loadingDiscounts ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : discounts.length > 0 ? (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Level 1 Category</TableCell>
                <TableCell>End Category</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.map((d) => (
                <TableRow key={d._id}>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>
                    {d.type === "Product"
                      ? products.find(p => p.id === d.product_id)?.product_name || d.product_id
                      : d.type === "Category"
                      ? `${d.category_level1_name || ""} → ${d.category_end_name || ""}`
                      : d.type === "Brand"
                      ? brands.find(b => b.id === d.brand_id)?.name || d.brand_id
                      : "Order"}
                  </TableCell>
                  <TableCell>{d.category_level1_name || "-"}</TableCell>
                  <TableCell>{d.category_end_name || "-"}</TableCell>
                  <TableCell>
                    {d.type === "Product" && d.min_quantity
                      ? `Min Qty: ${d.min_quantity}`
                      : d.type === "Order" && d.min_order_value
                      ? `Min Value: ₹${d.min_order_value}`
                      : "-"}
                  </TableCell>
                  <TableCell>{d.discount_type === "%" ? `${d.discount_value}%` : `₹${d.discount_value}`}</TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => handleRemove(d._id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <Snackbar open={!!message.text} autoHideDuration={4000} onClose={() => setMessage({ text: "", type: "success" })}>
        <Alert severity={message.type}>{message.text}</Alert>
      </Snackbar>
    </Box>
  );
}
