import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useLoader } from "./hooks/useLoader";
import Scene from "./components/Scene";
import LoadingScreen from "./components/LoadingScreen";
import UI from "./components/UI";

import { ProductPricingProvider } from "./hooks/useProductPricing";
import { CartProvider } from "./context/CartContext";

import Checkout from "./pages/Checkout";
import CheckoutConfirm from "./pages/CheckoutConfirm";

function HomePage() {
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [categorySelectedMaterial, setCategorySelectedMaterial] = useState({});
  const [clickedMeshCategory, setClickedMeshCategory] = useState("")


  return (
    <div className="h-screen bg-blue-100 p-4">
      <div className="relative h-full rounded-4xl overflow-hidden shadow-xl">
        <Scene
          showMeasurements={showMeasurements}
          setShowMeasurements={setShowMeasurements}
          categorySelectedMaterial={categorySelectedMaterial}
          activeMaterial={activeMaterial}
          setActiveMaterial={setActiveMaterial}
          setCategorySelectedMaterial={setCategorySelectedMaterial}
          clickedMeshCategory={clickedMeshCategory}
          setClickedMeshCategory={setClickedMeshCategory}
        />
        <UI
          showMeasurements={showMeasurements}
          setShowMeasurements={setShowMeasurements}
          setActiveMaterial={setActiveMaterial}
          setCategorySelectedMaterial={setCategorySelectedMaterial}
          onCheckout={() => (window.location.href = "/checkout")}
          clickedMeshCategory={clickedMeshCategory}
          setClickedMeshCategory={setClickedMeshCategory}
        />
      </div>
    </div>
  );
}

function App() {
  const { loading } = useLoader();

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <CartProvider>
        <ProductPricingProvider>
          <Routes>
            {/* MAIN 3D CONFIGURATOR */}
            <Route path="/" element={<HomePage />} />

            {/* CHECKOUT PAGE */}
            <Route path="/checkout" element={<Checkout />} />

            {/* CONFIRMATION PAGE */}
            <Route path="/confirm" element={<CheckoutConfirm />} />

            {/* OPTIONAL: 404 FALLBACK */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </ProductPricingProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
