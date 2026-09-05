import React, { useState, useEffect } from 'react';
import './FleetDashboard.css';

export default function FleetDashboard({ user, onLogout }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedEquipmentItem, setSelectedEquipmentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fleet Excel Data State
  const [fleetColumns, setFleetColumns] = useState([]);
  const [fleetRows, setFleetRows] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(false);
  const [fleetError, setFleetError] = useState(null);

  // Equipment Explorer Global JSON State
  const [equipmentTree, setEquipmentTree] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  // Accordion Sections in Left Sidebar
  const [openSections, setOpenSections] = useState({
    maintenance: false,
    purchasing: false,
    inventory: false,
  });

  // Individual Sub-Menu Toggle State (for Equipment Explorer, Purchase Order, etc.)
  const [openSubMenus, setOpenSubMenus] = useState({});

  // Fetch Equipment Explorer JSON from Python on initial load
  useEffect(() => {
    fetchEquipmentExplorerFromPython();
  }, []);

  const fetchEquipmentExplorerFromPython = async () => {
    setLoadingEquipment(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/equipment-explorer');
      const result = await response.json();
      if (result.success && result.data?.tree) {
        setEquipmentTree(result.data.tree);
      }
    } catch (err) {
      console.error('Failed to load Equipment Explorer JSON from app.py', err);
    } finally {
      setLoadingEquipment(false);
    }
  };

  // Fetch Fleet Excel Data
  const fetchFleetFromPython = async () => {
    setActiveTab('Fleet Overview');
    setActiveCategory('SYSTEM');
    setSelectedEquipmentItem(null);
    setLoadingFleet(true);
    setFleetError(null);

    try {
      const response = await fetch('http://127.0.0.1:5001/api/fleet');
      const result = await response.json();

      if (result.success) {
        setFleetColumns(result.columns);
        setFleetRows(result.data);
      } else {
        setFleetError(result.error || 'Failed to load Excel data');
      }
    } catch (err) {
      setFleetError('Unable to connect to Python app.py backend.');
    } finally {
      setLoadingFleet(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSubMenu = (item) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  // Toggle individual tree node
  const toggleEquipmentNode = (e, nodeId) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Collapse All or Expand All Nodes
  const toggleCollapseAllNodes = (expandState) => {
    const newExpandedState = {};
    if (expandState) {
      equipmentTree.forEach((node) => {
        newExpandedState[node.id] = true;
      });
    }
    setExpandedNodes(newExpandedState);
  };

  const selectNode = (node) => {
    setSelectedEquipmentItem(node);
    if (node.children || node.items) {
      setExpandedNodes((prev) => ({
        ...prev,
        [node.id]: true,
      }));
    }
  };

  // Helper function to extract records from any level of the node tree
  const resolveEquipmentRecords = (node) => {
    if (!node) return [];
    if (Array.isArray(node.items) && node.items.length > 0) {
      return node.items;
    }
    return [];
  };

  const menuData = {
    maintenance: {
      title: 'MAINTENANCE',
      items: [
        'Equipment Explorer',
        'Find Equipment',
        'Find Part',
        'Service Explorer',
        'Vessel Certificate',
        'Vessel Certificate Dashboard',
        'Documents & Search',
      ],
    },
    purchasing: {
      title: 'PURCHASING',
      items: [
        'Purchase Order',
        'Request For Quotation',
        'Landing Order',
        'Invoice Explorer',
        'Vendor Catalogue',
      ],
    },
    inventory: {
      title: 'INVENTORY',
      items: [
        'Stock Overview',
        'Item Transfers',
        'Min/Max Thresholds',
        'Serialized Item Query',
        'Audit & Reconciliation',
      ],
    },
  };

  const currentRecords = resolveEquipmentRecords(selectedEquipmentItem);

  /**
   * DYNAMIC TABLE RENDERER
   * Automatically picks columns from JSON and displays + / - based on depth.
   */
  const renderDynamicTable = (dataList) => {
    if (!dataList || dataList.length === 0) {
      return <div className="lms-empty-state">No records found.</div>;
    }

    // Dynamically extract columns from the first object (ignoring children/items arrays)
    const columns = Object.keys(dataList[0]).filter(
      (key) => key !== 'children' && key !== 'items'
    );

    // Filter based on search term
    const filteredData = dataList.filter((row) =>
      columns.some((col) =>
        String(row[col]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    return (
      <table className="lms-table">
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}></th>
            {columns.map((col) => (
              <th key={col}>{col.toUpperCase().replace(/_/g, ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => {
            // Determine if the row has children/items to drill down into
            const canDrillDown =
              (row.children && row.children.length > 0) ||
              (row.items && row.items.length > 0);

            return (
              <tr
                key={row.id || row.code || idx}
                className={canDrillDown ? 'lms-row-clickable' : ''}
                onClick={() => (canDrillDown ? selectNode(row) : null)}
              >
                <td
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: canDrillDown ? '#0284c7' : '#94a3b8',
                  }}
                >
                  {canDrillDown ? '+' : '-'}
                </td>
                {columns.map((col) => (
                  <td key={col}>
                    {/* Render values beautifully based on key names if needed, or just plain text */}
                    {col === 'status' ? (
                      <span className="status-pill operational">{row[col]}</span>
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="lms-app-layout">
      {/* HEADER CONTAINER */}
      <header className="lms-header-wrapper">
        <div className="lms-top-bar">
          <div className="lms-brand-center">
            <span className="lms-status-indicator"></span>
            <span className="lms-company-name">Lotus Marine Software</span>
          </div>
        </div>

        <div className="lms-header-divider" />

        {/* SUB-BAR WITH RED FLEET BADGE */}
        <div className="lms-sub-bar">
          <div className="lms-sub-left" />

          <div className="lms-sub-center">
            <button
              type="button"
              onClick={fetchFleetFromPython}
              className="lms-fleet-badge-btn"
            >
              FLEET
            </button>
          </div>

          <div className="lms-sub-right">
            <a href="#help" onClick={(e) => e.preventDefault()} className="lms-sub-link">Help</a>
            <span className="lms-sub-separator">|</span>
            <a href="#settings" onClick={(e) => e.preventDefault()} className="lms-sub-link">Account Settings</a>
            <span className="lms-sub-separator">|</span>
            <a href="#training" onClick={(e) => e.preventDefault()} className="lms-sub-link">Training</a>
            <span className="lms-sub-separator">|</span>
            <button onClick={onLogout} type="button" className="lms-sub-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE BODY */}
      <div className="lms-workspace-body">
        {/* LEFT NAVIGATOR */}
        <aside className="lms-sidebar">
          <div className="lms-sidebar-header">
            <span>NAVIGATOR</span>
          </div>

          <div className="lms-menu-tree">
            {Object.keys(menuData).map((key) => {
              const section = menuData[key];
              const isSectionOpen = openSections[key];

              return (
                <div key={key} className="lms-menu-group">
                  <button
                    type="button"
                    className={`lms-group-btn ${isSectionOpen ? 'is-expanded' : ''}`}
                    onClick={() => toggleSection(key)}
                  >
                    <span className="lms-group-title">{section.title}</span>
                    <span className="lms-group-chevron">{isSectionOpen ? '▾' : '▸'}</span>
                  </button>

                  {isSectionOpen && (
                    <ul className="lms-subitem-list">
                      {section.items.map((item) => {
                        const isSubMenuOpen = openSubMenus[item];

                        return (
                          <li key={item}>
                            <button
                              type="button"
                              className={`lms-subitem-btn ${
                                activeTab === item ? 'is-selected' : ''
                              }`}
                              onClick={() => {
                                setActiveTab(item);
                                setActiveCategory(section.title);
                                setSelectedEquipmentItem(null);
                                setSearchTerm('');
                                toggleSubMenu(item);
                              }}
                            >
                              <span className="flex-1 text-left lms-subitem-text">
                                {item}
                              </span>
                              <span className="tree-toggle-arrow">
                                {isSubMenuOpen ? '▾' : '▸'}
                              </span>
                            </button>

                            {/* COLLAPSIBLE SUB-TREE FOR ALL MENU ITEMS */}
                            {isSubMenuOpen && (
                              <div className="lms-json-tree-container">
                                {item === 'Equipment Explorer' ? (
                                  <>
                                    {/* GLOBAL EXPAND/COLLAPSE TOOLBAR */}
                                    <div className="lms-tree-actions-toolbar">
                                      <button
                                        type="button"
                                        onClick={() => toggleCollapseAllNodes(true)}
                                        className="tree-action-btn"
                                      >
                                        + Expand All
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => toggleCollapseAllNodes(false)}
                                        className="tree-action-btn"
                                      >
                                        - Collapse All
                                      </button>
                                    </div>

                                    {loadingEquipment ? (
                                      <div className="lms-tree-loading">Loading tree...</div>
                                    ) : (
                                      equipmentTree.map((node) => (
                                        <div key={node.id} className="lms-tree-node">
                                          <div
                                            className={`lms-tree-node-title ${
                                              selectedEquipmentItem?.id === node.id ? 'is-selected-node' : ''
                                            }`}
                                            onClick={() => selectNode(node)}
                                          >
                                            {node.children ? (
                                              <button
                                                type="button"
                                                className="lms-plus-minus-btn"
                                                onClick={(e) => toggleEquipmentNode(e, node.id)}
                                              >
                                                {expandedNodes[node.id] ? '-' : '+'}
                                              </button>
                                            ) : (
                                              <span className="lms-plus-minus-spacer">•</span>
                                            )}
                                            <span className="lms-tree-label">{node.name}</span>
                                          </div>

                                          {/* SUB-CHILDREN LEVEL 2 */}
                                          {node.children && expandedNodes[node.id] && (
                                            <div className="lms-tree-subchildren">
                                              {node.children.map((child) => (
                                                <div
                                                  key={child.id}
                                                  className={`lms-tree-subnode ${
                                                    selectedEquipmentItem?.id === child.id ? 'is-active-subnode' : ''
                                                  }`}
                                                  onClick={() => selectNode(child)}
                                                >
                                                  <span className="lms-tree-bullet">├─</span>
                                                  <span>{child.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    )}
                                  </>
                                ) : (
                                  /* Placeholder for other menus when they get their JSON */
                                  <div className="lms-tree-loading" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                                    Hierarchical data not yet loaded for {item}...
                                  </div>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT WORKSPACE DISPLAY */}
        <main className="lms-main-view">
          {activeTab ? (
            <>
              {/* CLICKABLE BREADCRUMBS */}
              <div className="lms-breadcrumbs">
                <span className="breadcrumb-clickable" onClick={() => { setActiveTab(null); setSelectedEquipmentItem(null); }}>
                  WORKSPACE
                </span>
                {' / '}
                <span className="breadcrumb-clickable" onClick={() => setSelectedEquipmentItem(null)}>
                  {activeCategory}
                </span>
                {' / '}
                <span className="breadcrumb-clickable" onClick={() => setSelectedEquipmentItem(null)}>
                  {activeTab}
                </span>
                {selectedEquipmentItem && (
                  <>
                    {' / '}
                    <span className="active-path">{selectedEquipmentItem.name}</span>
                  </>
                )}
              </div>

              <div className="lms-page-toolbar">
                <h1 className="lms-page-title">
                  {selectedEquipmentItem ? selectedEquipmentItem.name : activeTab}
                </h1>
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="lms-search-box"
                />
              </div>

              <div className="lms-viewport-container">
                <div className="lms-data-panel">
                  <div className="lms-panel-header">
                    <h3>
                      {(selectedEquipmentItem?.name || activeTab).toUpperCase()} EXPLORER
                    </h3>
                    <span className="lms-badge-live">TABLE VIEW</span>
                  </div>

                  <div className="lms-panel-body">
                    {/* FLEET EXCEL TABLE */}
                    {activeTab === 'Fleet Overview' ? (
                      loadingFleet ? (
                        <div className="lms-loading">Loading Fleet data</div>
                      ) : fleetError ? (
                        <div className="lms-error">{fleetError}</div>
                      ) : (
                        <table className="lms-table">
                          <thead>
                            <tr>
                              {fleetColumns.map((col) => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fleetRows
                              .filter((row) =>
                                Object.values(row).some((val) =>
                                  String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                )
                              )
                              .map((row, idx) => (
                                <tr key={idx}>
                                  {fleetColumns.map((col) => (
                                    <td key={col}>{row[col]}</td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )
                    ) : activeTab === 'Equipment Explorer' ? (
                      /* DYNAMIC TREE TABLES */
                      currentRecords.length > 0
                        ? renderDynamicTable(currentRecords) /* Level 3 */
                        : selectedEquipmentItem?.children
                        ? renderDynamicTable(selectedEquipmentItem.children) /* Level 2 */
                        : renderDynamicTable(equipmentTree) /* Level 1 */
                    ) : (
                      <div className="lms-empty-state">
                        <span className="lms-icon-symbol">⚓</span>
                        <h4>{activeTab}</h4>
                        <p>Showing records for <strong>{activeTab}</strong>.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* DEFAULT LANDING PANEL */
            <div className="lms-viewport-container">
              <div className="lms-data-panel">
                <div className="lms-empty-state">
                  <span className="lms-icon-symbol">⚓</span>
                  <h4>Lotus Marine ERP Workspace</h4>
                  <p>Click on <strong>FLEET</strong> at the top or choose a module from the Navigator on the left to load live records.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}