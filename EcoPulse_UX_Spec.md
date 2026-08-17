
# **UI/UX Master Specification Document**

**Target Platform:** React \+ Tailwind CSS (Google Earth Engine Wrapper)

### **CRITICAL IMPLEMENTATION DIRECTIVE: PRESERVING CORE LOGIC**

Scope of Document:  
This specification strictly defines the Visual Layer (UI/UX) and Frontend Behavior. It is NOT a mandate to rewrite the application's core logic.  
Backend Integrity:  
The existing backend functionalities (Google Earth Engine scripts, Analysis Engines, Data Fetching logic) MUST NOT be discarded or replaced. The goal is to map the existing robust backend logic to these new UI components.  
**Integration Strategy:**

* **Do not delete working logic.** If the current app has a calculateCarbon() function, preserve it and wire its output to the new KPI Cards in the Right Panel.  
* **Widget Replacement, Not Logic Replacement.** If the current app uses a GEE ui.Select widget for filtering regions, replace the *visual widget* with the new React Dropdown defined below, but ensure it triggers the exact same ee.Filter logic on the backend.  
* **MANDATORY DATA BINDING (NO MOCK DATA).** The frontend components defined here MUST be hydrated with real-time data fetched from Google Earth Engine. **Remove all instances of mockData.ts or static JSON arrays.** The UI must reflect the actual state of the ee.Image or ee.FeatureCollection being analyzed.

## **1\. Design Philosophy**

Core Identity: "The National Monitor"  
The application serves as a high-fidelity, authoritative environmental instrument. It bridges the gap between a government official portal (stable, serious) and a modern SaaS tool (responsive, sleek).  
**Visual Metaphor: "Gold in the Forest"**

* **The Canvas:** Deep Forest Green represents the dense canopy and the seriousness of the subject matter.  
* **The Accent:** Sharp Gold represents mineral wealth, data value, and critical alerts.

**Interaction Model: Input → Process → Output**

1. **Left Panel (Input):** User defines scope (Region, District) and selects data layers.  
2. **Center (Process):** The Map visualizes the geospatial reality.  
3. **Right Panel (Output):** The dashboard calculates statistics (Carbon/Tree Loss) based on the view.

## **2\. Global Design Tokens**

### **Color Palette**

The application uses a strict high-contrast dark mode. Do not introduce grey backgrounds; use transparency instead.

| Token Name | Hex | Tailwind Class | Usage Rule |
| :---- | :---- | :---- | :---- |
| **Deep Forest** | \#052e16 | bg-\[\#052e16\] | Main application background, Map tile base color. |
| **Glass Surface** | \#052e16 | bg-\[\#052e16\]/90 | Sidebars, Floating Panels. Must include blur. |
| **Royal Gold** | \#fbbf24 | text-amber-400 | Active icons, KPI values, Primary text highlights. |
| **Muted Gold** | \#f59e0b | border-amber-500 | Borders, Shadows, Scrollbar thumbs. |
| **Clean White** | \#ffffff | text-white | Section headers, Primary labels. |
| **Faded Gold** | \#fef3c7 | text-amber-100/40 | Secondary labels (e.g., "DATA LAYERS"). |

### **Typography**

**Font Family:** Inter (Sans-Serif).

* **Headers (H1-H3):** Uppercase, Bold (700-900), Wide Tracking.  
  * text-\[10px\] font-black uppercase tracking-\[0.25em\]  
* **Data/KPIs:** Tabular Numerals, Tight Tracking.  
  * text-3xl font-extrabold tracking-tighter

### **Visual Effects**

* **Glassmorphism:** All floating panels must use:  
  * backdrop-blur-xl border border-amber-500/30 shadow-2xl  
* **Transitions:** All UI movements (sliding panels, hover states) use:  
  * duration-500 ease-\[cubic-bezier(0.4, 0, 0.2, 1)\]  
* **Shadows:** Deep, diffuse shadows for sidebars:  
  * shadow-\[20px\_0\_50px\_rgba(0,0,0,0.6)\]

## **3\. Layout Architecture**

The application utilizes a **Z-Index Layering Strategy** to ensure map interactivity while maintaining UI accessibility.

### **Z-Index Stack**

* **Layer 0 (Map):** Leaflet/GEE Map Container (absolute inset-0).  
* **Layer 30 (Panels):** Left Sidebar, Right Sidebar, Floating Map Controls.  
* **Layer 40 (Overlays):** Top Header, Time Slider, Legend Panel.  
* **Layer 50 (Modals):** Tooltips, Dropdown Menus.

### **Dual Collapsible Sidebar Logic**

The application features two independent sidebars. The map remains full-screen behind them.

* **Left Panel (Inputs):**  
  * Width: 320px (w-80).  
  * State Open: translate-x-0.  
  * State Closed: \-translate-x-full.  
* **Right Panel (Outputs):**  
  * Width: 320px (w-80).  
  * State Open: translate-x-0.  
  * State Closed: translate-x-full.

## **4\. Component Specifications**

### **1\. Top Header (The Official Seal)**

* **Position:** Absolute Top, Height 16 (64px).  
* **Style:** Deep Forest (95% opacity) with bottom border (Amber-500/30).  
* **Content Left:**  
  * Logo: "EcoPulse" (White) \+ "Ghana" (Gold).  
  * Badge: "OFFICIAL PORTAL" (Small text, bordered pill).  
* **Content Right:** Search Bar (Pill shape, glass background), Settings Icon.

### **2\. Left Panel (Control Deck)**

**Role:** Configuration and Filtering.

* **Section 1: Analysis Filters.** Region and District dropdowns. Styled with bg-green-900/40.  
  * *Data Source:* Options must be populated dynamically from the GEE FeatureCollection properties, not hardcoded strings.  
* **Section 2: Data Layers.** A "Pop-over" menu triggered by a button.  
  * *Data Source:* Toggling these MUST directly call .setOpacity() on the corresponding ee.Image layers in the map instance.  
* **Section 3: Legend Trigger.** A full-width button at the bottom labeled "SHOW LEGEND".  
  * **Active:** Gold Background, Dark Text.  
  * **Inactive:** Transparent Background, Gold Border.

### **3\. Right Panel (Analytics Deck)**

**Role:** Statistical Output.

* **KPI Cards:** "Tree Loss (YTD)" and "Carbon Stock".  
  * *Data Source:* Values must be the result of ee.Reducer.sum() or similar aggregations running on the backend.  
* **Sunburst Chart (Land Composition):**  
  * **Structure:** Nested Pie Chart (Recharts).  
  * **Inner Ring:** Parent Categories (Forest, Water, Urban).  
  * **Outer Ring:** Sub-categories (Primary Forest, Illegal Mining, River Basin).  
  * *Data Source:* Must consume the JSON output of a GEE histogram reduction (reduceRegion).  
* **Footer:** System Status indicators ("Network Active").

### **4\. Floating Legend (MapBiomas Style)**

**Role:** On-demand map key.

* **Behavior:** Floating Glass Card. Hidden by default.  
* **Dynamic Position:**  
  * If Left Panel Open: left-\[336px\].  
  * If Left Panel Closed: left-6.  
* **Content:** List of colored squares and labels (e.g., Gold Square \= Mining Anomaly).  
  * *Note:* Ensure colors match the visualization parameters (visParams) defined in the GEE script.

### **5\. Smart Map Controls**

**Role:** Zoom and History tools.

* **Structure:** Vertical Glass Pill (Zoom \+, Zoom \-, History Clock).  
* **Dynamic Position:**  
  * If Right Panel Open: right-\[336px\] (Slides left to avoid overlap).  
  * If Right Panel Closed: right-6 (Snaps to edge).

### **6\. Historical Telemetry (Time Slider)**

**Role:** Playback of deforestation data (2015-2024).

* **Trigger:** Toggled via the "History" (Clock) icon.  
* **Position:** Bottom Center.  
* **Styling:**  
  * Slider Track: Deep Green.  
  * Slider Thumb: **Gold Square** (Custom CSS).  
  * Year Display: Large Gold Font.  
  * *Data Source:* Dragging this slider must update the filtered Date Range of the GEE ImageCollection and refresh the map tiles.

## **5\. Technical Implementation Notes**

### **Tailwind Configuration**

Ensure the tailwind.config.js includes the custom color definitions to match the Hex codes provided in Section 2\.

### **Custom Scrollbars**

To maintain the "Royal" aesthetic, native browser scrollbars must be hidden. Use the following CSS:

::-webkit-scrollbar {  
  width: 5px;  
}  
::-webkit-scrollbar-track {  
  background: rgba(5, 46, 22, 0.5);  
}  
::-webkit-scrollbar-thumb {  
  background: \#fbbf24;  
  border-radius: 0px;  
}

### **Animation Logic**

For the "Smart Map Controls" sliding effect, use this specific transition string in **React**:

className={\`absolute bottom-12 transition-all duration-500 ease-\[cubic-bezier(0.4,0,0.2,1)\] ${  
  isRightCollapsed ? 'right-6' : 'right-\[336px\]'  
}\`}  
