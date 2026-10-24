import React, { useState, useEffect } from 'react';
import { 
  SourceFile, 
  UpdateRecord, 
  DeploymentInfo, 
  FirebaseStatusInfo,
  Product,
  Category,
  Banner,
  Order,
  SiteSettings
} from '../../types';
import { sourceCodeService } from '../../services/sourceCodeService';
import { 
  firebaseService, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  getStoredFirebaseConfig 
} from '../../services/firebaseService';
import { storageService } from '../../services/storageService';
import { 
  Code2, 
  FolderTree, 
  FileCode, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Server, 
  ShieldCheck, 
  Copy, 
  FileArchive, 
  FileSpreadsheet, 
  FileJson, 
  Clock, 
  ExternalLink, 
  Eye, 
  X, 
  Lock,
  HardDriveDownload,
  Info
} from 'lucide-react';

interface SourceCodeUpdatesManagerProps {
  adminEmail: string;
  currency?: string;
}

export const SourceCodeUpdatesManager: React.FC<SourceCodeUpdatesManagerProps> = ({
  adminEmail,
  currency = '৳'
}) => {
  const [subTab, setSubTab] = useState<'source' | 'updates' | 'deployment' | 'firebase' | 'backup'>('source');

  // Source files state
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<SourceFile | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipSuccessMessage, setZipSuccessMessage] = useState(false);

  // Update records state
  const [updateRecords, setUpdateRecords] = useState<UpdateRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [reviewingRecord, setReviewingRecord] = useState<UpdateRecord | null>(null);

  // Deployment status state
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo>(sourceCodeService.getDeploymentInfo());
  const [isCheckingDeployment, setIsCheckingDeployment] = useState(false);
  const [deploymentCheckTime, setDeploymentCheckTime] = useState<string>(new Date().toLocaleTimeString());

  // Firebase status state
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseStatusInfo>({
    state: 'Not Configured',
    projectId: null,
    authConfigured: false,
    firestoreConfigured: false,
    lastConnectionCheck: null,
    diagnosticError: null
  });
  const [isCheckingFirebase, setIsCheckingFirebase] = useState(false);
  const [customFirebaseInput, setCustomFirebaseInput] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Backup & export state
  const [anonymizeCustomerPii, setAnonymizeCustomerPii] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [syncResultMessage, setSyncResultMessage] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    timestamp: string;
    details?: {
      initPassed: boolean;
      authPassed: boolean;
      readPassed: boolean;
      productsCount?: number;
      latencyMs?: number;
      databaseId?: string;
    };
  } | null>(null);

  // Load initial data
  useEffect(() => {
    const files = sourceCodeService.getProjectSourceFiles();
    setSourceFiles(files);
    setSelectedFile(files[0] || null);
    setUpdateRecords(sourceCodeService.getUpdateRecords());
    checkFirebase(false);
  }, []);

  const checkFirebase = async (isManualClick = false) => {
    setIsCheckingFirebase(true);
    if (isManualClick) {
      setConnectionTestResult(null);
    }
    try {
      const status = await firebaseService.checkConnectionStatus();
      setFirebaseStatus(status);
      if (isManualClick) {
        if (status.state === 'Connected') {
          const count = status.testDetails?.productsCount ?? 0;
          const latency = status.testDetails?.latencyMs !== undefined ? ` (${status.testDetails.latencyMs}ms)` : '';
          setConnectionTestResult({
            type: 'success',
            title: 'Firebase Connection Test Passed',
            message: status.testDetails?.summary || `Successfully connected to database "${status.databaseId}". Verified live read from "products" collection (${count} items detected)${latency}.`,
            timestamp: new Date().toLocaleTimeString(),
            details: {
              initPassed: status.testDetails?.initPassed ?? true,
              authPassed: status.testDetails?.authPassed ?? true,
              readPassed: status.testDetails?.readPassed ?? true,
              productsCount: status.testDetails?.productsCount,
              latencyMs: status.testDetails?.latencyMs,
              databaseId: status.databaseId
            }
          });
        } else {
          setConnectionTestResult({
            type: 'error',
            title: 'Firebase Connection Test Failed',
            message: status.diagnosticError || status.testDetails?.summary || 'Connection failed.',
            timestamp: new Date().toLocaleTimeString(),
            details: {
              initPassed: status.testDetails?.initPassed ?? false,
              authPassed: status.testDetails?.authPassed ?? false,
              readPassed: false,
              latencyMs: status.testDetails?.latencyMs,
              databaseId: status.databaseId
            }
          });
        }
      }
    } catch (e: any) {
      const errorMsg = e.message || 'Firebase connection check failed.';
      setFirebaseStatus({
        state: 'Connection Error',
        projectId: null,
        authConfigured: false,
        firestoreConfigured: false,
        lastConnectionCheck: new Date().toISOString(),
        diagnosticError: errorMsg
      });
      if (isManualClick) {
        setConnectionTestResult({
          type: 'error',
          title: 'Connection Test Error',
          message: errorMsg,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } finally {
      setIsCheckingFirebase(false);
    }
  };

  const handleSyncCatalogToFirestore = async () => {
    setIsSyncingCatalog(true);
    setSyncResultMessage(null);
    try {
      const result = await firebaseService.syncAllToFirestore({
        products: storageService.getProducts(),
        categories: storageService.getCategories(),
        banners: storageService.getBanners(),
        settings: storageService.getSettings()
      });
      if (result.success) {
        setSyncResultMessage(`Successfully published ${result.count} documents to Cloud Firestore database!`);
      } else {
        setSyncResultMessage(`Sync Notice: ${result.error || 'Check Firestore permissions'}`);
      }
    } catch (err: any) {
      setSyncResultMessage(`Sync error: ${err.message}`);
    } finally {
      setIsSyncingCatalog(false);
      setTimeout(() => setSyncResultMessage(null), 8000);
    }
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard?.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Genuine ZIP Export
  const handleDownloadSourceZip = async () => {
    setIsExportingZip(true);
    try {
      const blob = await sourceCodeService.generateZipArchive();
      sourceCodeService.downloadBlob(blob, `kotliver-collection-src-v1.1.0.zip`);
      setZipSuccessMessage(true);
      setTimeout(() => setZipSuccessMessage(false), 3500);
    } catch (err) {
      console.error('ZIP generation error:', err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Upload update package handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const validation = await sourceCodeService.validateUpdateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file.');
        setIsUploading(false);
        return;
      }

      const newRecord: UpdateRecord = {
        id: `upd-${Date.now()}`,
        fileName: file.name,
        version: validation.parsedManifest?.version || `1.1.${updateRecords.length + 1}`,
        uploadedAt: new Date().toISOString(),
        description: validation.parsedManifest?.description || `Uploaded package: ${file.name}`,
        status: 'Ready for Review',
        fileSize: validation.fileSize,
        author: adminEmail,
        changesSummary: validation.parsedManifest?.changes || [
          `Uploaded package ${file.name} (${Math.round(validation.fileSize / 1024)} KB)`
        ],
        updateType: file.name.endsWith('.json') ? 'config' : 'patch',
        payloadData: validation.parsedManifest
      };

      sourceCodeService.saveUpdateRecord(newRecord);
      setUpdateRecords(sourceCodeService.getUpdateRecords());
      setReviewingRecord(newRecord);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing file.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Apply update handler
  const handleApplyUpdate = (record: UpdateRecord) => {
    const result = sourceCodeService.applyUpdate(record.id, record.payloadData);
    setUpdateRecords(sourceCodeService.getUpdateRecords());
    if (result.success) {
      alert(result.message);
      setReviewingRecord(null);
    } else {
      alert(`Update failed: ${result.message}`);
    }
  };

  // Rollback update handler
  const handleRollbackUpdate = (record: UpdateRecord) => {
    if (window.confirm(`Are you sure you want to rollback version ${record.version}?`)) {
      const result = sourceCodeService.rollbackUpdate(record.id);
      setUpdateRecords(sourceCodeService.getUpdateRecords());
      alert(result.message);
      setReviewingRecord(null);
    }
  };

  // Check Deployment Status
  const handleCheckDeployment = async () => {
    setIsCheckingDeployment(true);
    const start = Date.now();
    try {
      // Real ping check to current origin
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
      const latency = Date.now() - start;
      const updated = sourceCodeService.getDeploymentInfo();
      setDeploymentInfo({
        ...updated,
        status: 'Healthy (Online)',
        environment: `${updated.environment} (Ping: ${latency}ms)`
      });
      setDeploymentCheckTime(new Date().toLocaleTimeString());
    } catch {
      setDeploymentInfo((prev) => ({
        ...prev,
        status: 'Degraded'
      }));
    } finally {
      setIsCheckingDeployment(false);
    }
  };

  // Save pasted Firebase config
  const handleSaveCustomFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(customFirebaseInput);
      if (!parsed.projectId || !parsed.apiKey) {
        alert('Configuration must contain at least "projectId" and "apiKey".');
        return;
      }
      saveFirebaseConfig(parsed);
      setShowConfigModal(false);
      setCustomFirebaseInput('');
      checkFirebase();
      alert('Firebase configuration saved successfully. Rechecking connection...');
    } catch {
      alert('Invalid JSON formatting. Please paste your complete Firebase web config object.');
    }
  };

  // DATA EXPORT HANDLERS
  const handleExportJson = (type: 'products' | 'categories' | 'banners' | 'orders' | 'settings' | 'all') => {
    let exportData: any = {};
    let filename = `kotliver-${type}-${new Date().toISOString().split('T')[0]}.json`;

    if (type === 'products') {
      exportData = storageService.getProducts();
    } else if (type === 'categories') {
      exportData = storageService.getCategories();
    } else if (type === 'banners') {
      exportData = storageService.getBanners();
    } else if (type === 'settings') {
      exportData = storageService.getSettings();
    } else if (type === 'orders') {
      const orders = storageService.getOrders();
      if (anonymizeCustomerPii) {
        exportData = orders.map((o) => ({
          ...o,
          customerName: `${o.customerName[0]}***`,
          customerPhone: '01*********',
          customerEmail: o.customerEmail ? 'user***@hidden.com' : undefined,
          deliveryAddress: '*** Protected Address (PII Guard) ***'
        }));
      } else {
        exportData = orders;
      }
    } else if (type === 'all') {
      filename = `kotliver-full-database-${new Date().toISOString().split('T')[0]}.json`;
      exportData = {
        exportedAt: new Date().toISOString(),
        storeName: 'Kotliver Collection',
        products: storageService.getProducts(),
        categories: storageService.getCategories(),
        banners: storageService.getBanners(),
        adPlacements: storageService.getAdPlacements(),
        settings: storageService.getSettings(),
        orders: anonymizeCustomerPii
          ? storageService.getOrders().map((o) => ({
              ...o,
              customerName: `${o.customerName[0]}***`,
              customerPhone: '01*********',
              deliveryAddress: '*** Protected Address ***'
            }))
          : storageService.getOrders()
      };
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    sourceCodeService.downloadBlob(blob, filename);
    setExportSuccessMessage(`Successfully exported ${filename}`);
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  const handleExportCsv = (type: 'products' | 'categories' | 'orders') => {
    let csvString = '';
    let filename = `kotliver-${type}-${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'products') {
      const products = storageService.getProducts();
      csvString = sourceCodeService.generateCsv(products, [
        'id', 'sku', 'name', 'type', 'category', 'price', 'originalPrice', 'stock', 'rating', 'status', 'affiliatePlatform', 'affiliateUrl'
      ]);
    } else if (type === 'categories') {
      const categories = storageService.getCategories();
      csvString = sourceCodeService.generateCsv(categories, ['id', 'name', 'slug', 'description', 'productCount']);
    } else if (type === 'orders') {
      const orders = storageService.getOrders();
      const mappedOrders = orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: anonymizeCustomerPii ? `${o.customerName[0]}***` : o.customerName,
        customerPhone: anonymizeCustomerPii ? '01*********' : o.customerPhone,
        deliveryZone: o.deliveryZone,
        deliveryAddress: anonymizeCustomerPii ? '*** Protected Address ***' : o.deliveryAddress,
        deliveryFee: o.deliveryFee,
        subtotal: o.subtotal,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt
      }));
      csvString = sourceCodeService.generateCsv(mappedOrders, [
        'id', 'orderNumber', 'customerName', 'customerPhone', 'deliveryZone', 'deliveryAddress', 'total', 'status', 'createdAt'
      ]);
    }

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    sourceCodeService.downloadBlob(blob, filename);
    setExportSuccessMessage(`Successfully exported ${filename}`);
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D]">
            <Code2 className="w-4 h-4 text-[#D4A72C]" />
            <span>Developer & Operations Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900 mt-1">
            Source Code & Update Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real codebase inspection, update package management, live Firebase diagnostics, and database exports
          </p>
        </div>

        {/* Action Button: Download Full ZIP */}
        <button
          onClick={handleDownloadSourceZip}
          disabled={isExportingZip}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 shadow-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isExportingZip ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#D4A72C]" />
              <span>Generating ZIP Archive...</span>
            </>
          ) : (
            <>
              <FileArchive className="w-4 h-4 text-[#D4A72C]" />
              <span>Download Project Source (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {zipSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#176B4D]" />
          <span>Project source code archive generated and downloaded successfully!</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 pb-2">
        <button
          onClick={() => setSubTab('source')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'source'
              ? 'bg-[#176B4D] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Project Source Code</span>
        </button>

        <button
          onClick={() => setSubTab('updates')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'updates'
              ? 'bg-[#176B4D] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Update Files Manager</span>
        </button>

        <button
          onClick={() => setSubTab('deployment')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'deployment'
              ? 'bg-[#176B4D] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Deployment Status</span>
        </button>

        <button
          onClick={() => setSubTab('firebase')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'firebase'
              ? 'bg-[#176B4D] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Firebase Database Status</span>
        </button>

        <button
          onClick={() => setSubTab('backup')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            subTab === 'backup'
              ? 'bg-[#176B4D] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <HardDriveDownload className="w-4 h-4" />
          <span>Backup & Export</span>
        </button>
      </div>

      {/* SUBTAB A: PROJECT SOURCE CODE */}
      {subTab === 'source' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-gray-900 block text-sm">
                Project Name: Kotliver Collection
              </span>
              <span className="text-gray-500">
                Discovered {sourceFiles.length} real files across core, components, services, and configuration
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 font-mono text-[11px] font-semibold border border-emerald-200">
                Stack: React 19 &bull; Vite 8 &bull; Tailwind v4
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* File Tree Explorer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs max-h-[600px] overflow-y-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Project Explorer</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {sourceFiles.length} files
                </span>
              </div>

              <div className="space-y-1">
                {sourceFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      selectedFile?.path === file.path
                        ? 'bg-[#176B4D] text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode
                        className={`w-3.5 h-3.5 shrink-0 ${
                          selectedFile?.path === file.path ? 'text-[#D4A72C]' : 'text-gray-400'
                        }`}
                      />
                      <span className="truncate font-mono text-[11px]">{file.path}</span>
                    </div>
                    <span
                      className={`text-[10px] shrink-0 ml-2 font-mono ${
                        selectedFile?.path === file.path ? 'text-emerald-100' : 'text-gray-400'
                      }`}
                    >
                      {Math.round(file.size / 1024 * 10) / 10}k
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Read-only Code Viewer */}
            <div className="lg:col-span-2 bg-gray-950 rounded-2xl border border-gray-800 shadow-md flex flex-col overflow-hidden max-h-[600px]">
              {selectedFile ? (
                <>
                  {/* Code Viewer Header */}
                  <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-xs text-gray-300 shrink-0">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-white font-semibold">{selectedFile.path}</span>
                      <span className="text-gray-500">
                        ({selectedFile.size} bytes &bull; {selectedFile.extension.toUpperCase()})
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      <Copy className="w-3 h-3 text-[#D4A72C]" />
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Code Content Box */}
                  <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-gray-200 bg-gray-950 leading-relaxed select-text">
                    <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                  <FileCode className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-xs">Select a file from the explorer to view its contents.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB B: UPDATE FILES MANAGER */}
      {subTab === 'updates' && (
        <div className="space-y-6">
          {/* Uploader Box */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-800" />
                  <span>Upload Update Package or Configuration</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload supported release manifests (.json) or source archives (.zip). Max 10MB.
                </p>
              </div>

              {/* Upload Input */}
              <label className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 cursor-pointer flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto">
                <Upload className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{isUploading ? 'Validating...' : 'Select Update File'}</span>
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Safe Update Guarantee:</strong> Uploaded files are strictly validated against JSON schema and binary headers. Arbitrary script execution is prevented. Live deployments only occur through supported mechanisms.
              </span>
            </div>
          </div>

          {/* Release Records Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Release & Update History</h3>
              <span className="text-xs text-gray-500 font-mono">
                {updateRecords.length} records logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Release File</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {updateRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900 block truncate max-w-xs">
                          {rec.fileName}
                        </span>
                        <span className="text-[10px] text-gray-500 line-clamp-1">
                          {rec.description}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                          v{rec.version}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        {new Date(rec.uploadedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-gray-600 truncate max-w-[150px]">
                        {rec.author}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'Applied'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Ready for Review'
                              ? 'bg-blue-100 text-blue-800'
                              : rec.status === 'Rolled Back'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setReviewingRecord(rec)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                        >
                          Review & Action
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB C: WEBSITE VERSION & DEPLOYMENT STATUS */}
      {subTab === 'deployment' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#176B4D] block">
                  Environment Diagnostic
                </span>
                <h3 className="text-lg font-bold font-serif-brand text-gray-900 mt-0.5">
                  Website Deployment & Runtime Status
                </h3>
              </div>

              <button
                onClick={handleCheckDeployment}
                disabled={isCheckingDeployment}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDeployment ? 'animate-spin' : ''}`} />
                <span>Check Live Status</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Application Version
                </span>
                <span className="text-lg font-bold font-mono text-gray-900 mt-1 block">
                  v{deploymentInfo.version}
                </span>
                <span className="text-[11px] text-gray-400">Release Build</span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Health State
                </span>
                <span className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {deploymentInfo.status}
                </span>
                <span className="text-[11px] text-gray-400">Checked {deploymentCheckTime}</span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Build Stack
                </span>
                <span className="text-xs font-bold text-gray-900 mt-1 block">
                  {deploymentInfo.buildFramework}
                </span>
                <span className="text-[11px] text-gray-400">Port {deploymentInfo.port}</span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Last Successful Deployment
                </span>
                <span className="text-xs font-semibold text-gray-900 mt-1 block">
                  {deploymentInfo.lastSuccessfulDeployment}
                </span>
                <span className="text-[11px] text-gray-400">Automated Pipeline</span>
              </div>
            </div>

            {/* Hosting Details */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Server className="w-4 h-4 text-emerald-800" />
                <span>Deployment Architecture Information</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The current instance is running on Google Cloud Run containerized preview environment at <code className="bg-white px-1.5 py-0.5 rounded font-mono text-emerald-900 border border-emerald-200">{deploymentInfo.appUrl}</code>. Live continuous deployments are orchestrated through Google AI Studio Build.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB D: FIREBASE DATABASE STATUS */}
      {subTab === 'firebase' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#176B4D] block">
                  Cloud Infrastructure
                </span>
                <h3 className="text-lg font-bold font-serif-brand text-gray-900 mt-0.5">
                  Firebase Firestore & Authentication Diagnostics
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                >
                  Configure Firebase Keys
                </button>

                <button
                  onClick={() => checkFirebase(true)}
                  disabled={isCheckingFirebase}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingFirebase ? 'animate-spin' : ''}`} />
                  <span>{isCheckingFirebase ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* Connection Test Result Banner */}
            {connectionTestResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 animate-in fade-in transition-all ${
                  connectionTestResult.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-red-50 border-red-300 text-red-950 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  {connectionTestResult.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {connectionTestResult.title}
                      </span>
                      <span className="text-[11px] opacity-75 font-mono">
                        [{connectionTestResult.timestamp}]
                      </span>
                    </div>
                    <p className="leading-relaxed">
                      {connectionTestResult.message}
                    </p>
                    {connectionTestResult.details && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/70 text-[11px] flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <span className={connectionTestResult.details.initPassed ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                            {connectionTestResult.details.initPassed ? '✓' : '✗'} Firebase SDK
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className={connectionTestResult.details.authPassed ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                            {connectionTestResult.details.authPassed ? '✓' : '✗'} Auth Service
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className={connectionTestResult.details.readPassed ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                            {connectionTestResult.details.readPassed ? `✓ Products Read (${connectionTestResult.details.productsCount ?? 0} items)` : '✗ Products Read'}
                          </span>
                        </span>
                        {connectionTestResult.details.latencyMs !== undefined && (
                          <span className="text-gray-700 font-mono">• Latency: {connectionTestResult.details.latencyMs}ms</span>
                        )}
                        <span className="font-mono text-gray-700">• Database: {connectionTestResult.details.databaseId}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setConnectionTestResult(null)}
                  className="text-gray-400 hover:text-gray-700 p-1 shrink-0 cursor-pointer"
                  title="Dismiss message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Status Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Connection State
                </span>
                <span
                  className={`text-lg font-bold mt-1 inline-flex items-center gap-1.5 ${
                    firebaseStatus.state === 'Connected'
                      ? 'text-emerald-700'
                      : firebaseStatus.state === 'Configured'
                      ? 'text-blue-700'
                      : firebaseStatus.state === 'Connection Error'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  }`}
                >
                  {firebaseStatus.state === 'Connected' && <CheckCircle2 className="w-4 h-4" />}
                  {firebaseStatus.state === 'Connection Error' && <AlertCircle className="w-4 h-4" />}
                  {firebaseStatus.state === 'Not Configured' && <Info className="w-4 h-4" />}
                  {firebaseStatus.state}
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  {firebaseStatus.lastConnectionCheck
                    ? `Checked: ${new Date(firebaseStatus.lastConnectionCheck).toLocaleTimeString()}`
                    : 'Awaiting initial check'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Configured Project ID
                </span>
                <span className="text-base font-bold font-mono text-gray-900 mt-1 block truncate">
                  {firebaseStatus.projectId || 'None (Local Mode)'}
                </span>
                <span className="text-[11px] text-gray-400">
                  Database: {firebaseStatus.databaseId || '(default)'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                  Admin Verification
                </span>
                <span className="text-base font-bold text-gray-900 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  {adminEmail}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Verified Store Administrator
                </span>
              </div>
            </div>

            {/* Sync Result Banner */}
            {syncResultMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#176B4D]" />
                <span>{syncResultMessage}</span>
              </div>
            )}

            {/* Quick Actions & Live Firebase Console Link */}
            {firebaseStatus.state === 'Connected' && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold block text-sm text-emerald-900">
                    Cloud Firestore Active & Connected
                  </span>
                  <span className="text-emerald-700 text-[11px]">
                    Database Instance: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">{firebaseStatus.databaseId}</code>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseStatus.projectId}/firestore/databases/${firebaseStatus.databaseId}/data`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>View in Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={handleSyncCatalogToFirestore}
                    disabled={isSyncingCatalog}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
                    <span>{isSyncingCatalog ? 'Publishing...' : 'Sync Catalog to Firestore'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Diagnostic Message Box */}
            {firebaseStatus.diagnosticError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  Diagnostic Report
                </span>
                <p className="leading-relaxed">{firebaseStatus.diagnosticError}</p>
              </div>
            )}

            {/* Safe Fallback Clarification Notice */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1.5">
              <span className="font-bold text-gray-800 block text-xs">
                Safe Fallback & Data Segregation Policy:
              </span>
              <p className="leading-relaxed">
                When Firebase is in <strong>Not Configured</strong> or <strong>Connection Error</strong> status, Kotliver Collection runs using our verified local persistence adapter. All customer carts, Cash on Delivery orders, and product adjustments operate safely. Data is never deceptively labeled as live cloud sync until real Firestore connectivity is confirmed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB E: BACKUP & EXPORT */}
      {subTab === 'backup' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#176B4D] block">
                  Administrative Data Tools
                </span>
                <h3 className="text-lg font-bold font-serif-brand text-gray-900 mt-0.5">
                  Database Backup & Genuine Data Export
                </h3>
              </div>

              {/* Customer PII Privacy Guard Toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymizeCustomerPii}
                  onChange={(e) => setAnonymizeCustomerPii(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-800"
                />
                <span>Anonymize Customer PII in Order Exports</span>
              </label>
            </div>

            {exportSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#176B4D]" />
                <span>{exportSuccessMessage}</span>
              </div>
            )}

            {/* Export Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Products Export */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Products Catalog</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Direct products (COD) and affiliate partner deals (Daraz & Rokomari).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t flex items-center gap-2">
                  <button
                    onClick={() => handleExportJson('products')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-emerald-800" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => handleExportCsv('products')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Categories Export */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Categories & Departments</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Store category hierarchy, slug mappings, and icon assignments.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t flex items-center gap-2">
                  <button
                    onClick={() => handleExportJson('categories')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-emerald-800" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => handleExportCsv('categories')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Orders Export */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Customer Orders</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Cash on Delivery orders, delivery zones, items, and status timelines.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t flex items-center gap-2">
                  <button
                    onClick={() => handleExportJson('orders')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-emerald-800" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => handleExportCsv('orders')}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Banners Export */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Promotional Banners</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Hero carousel slides, mid-page banners, priorities, and image links.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <button
                    onClick={() => handleExportJson('banners')}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Export Banners JSON</span>
                  </button>
                </div>
              </div>

              {/* Website Settings Export */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Website Settings</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Store contact, delivery charges, and legal affiliate disclosure text.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <button
                    onClick={() => handleExportJson('settings')}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-800 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Export Settings JSON</span>
                  </button>
                </div>
              </div>

              {/* Full Store Database Bundle */}
              <div className="p-4 rounded-xl bg-emerald-950 text-white flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4A72C] text-gray-950 uppercase inline-block mb-1">
                    Full Snapshot
                  </span>
                  <h4 className="font-bold text-sm text-white">Full Database Bundle</h4>
                  <p className="text-xs text-gray-300 mt-1">
                    All tables, catalog, orders, banners, and settings consolidated into one file.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-900">
                  <button
                    onClick={() => handleExportJson('all')}
                    className="w-full py-2 px-3 rounded-lg bg-[#176B4D] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4A72C]" />
                    <span>Download Full Backup</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enterprise Backup Note */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <p>
                <strong>Production Cloud Backup Note:</strong> For continuous automated enterprise backups in Firestore, configure scheduled backups in Google Cloud Console (<code className="font-mono text-emerald-900">gcloud firestore backups schedules create</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW UPDATE MODAL */}
      {reviewingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-gray-900 font-serif-brand">
                Review Update: {reviewingRecord.fileName}
              </h3>
              <button
                onClick={() => setReviewingRecord(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Version:</span>
                <span className="font-mono font-bold text-gray-900">v{reviewingRecord.version}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Size:</span>
                <span className="font-mono">{Math.round(reviewingRecord.fileSize / 1024)} KB</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Status:</span>
                <span className="font-bold text-emerald-800">{reviewingRecord.status}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 space-y-1">
                <span className="font-bold text-gray-700 block">Description</span>
                <p className="text-gray-600">{reviewingRecord.description}</p>
              </div>

              {reviewingRecord.changesSummary && (
                <div className="p-3 rounded-xl bg-gray-50 space-y-1">
                  <span className="font-bold text-gray-700 block">Changes Included</span>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {reviewingRecord.changesSummary.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setReviewingRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>

              {reviewingRecord.status === 'Applied' && (
                <button
                  onClick={() => handleRollbackUpdate(reviewingRecord)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 cursor-pointer"
                >
                  Roll Back
                </button>
              )}

              {reviewingRecord.status !== 'Applied' && (
                <button
                  onClick={() => handleApplyUpdate(reviewingRecord)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 shadow-sm cursor-pointer"
                >
                  Apply Update Package
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FIREBASE CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-gray-900 font-serif-brand">
                Configure Firebase Web Credentials
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomFirebase} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Paste Firebase Config Object (JSON)
                </label>
                <textarea
                  rows={8}
                  required
                  value={customFirebaseInput}
                  onChange={(e) => setCustomFirebaseInput(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "kotliver-collection.firebaseapp.com",\n  "projectId": "kotliver-collection",\n  "storageBucket": "kotliver-collection.appspot.com"\n}`}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#176B4D]"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600">
                You can obtain this JSON snippet from the Firebase Console &gt; Project Settings &gt; General &gt; Your apps &gt; Web app.
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    clearFirebaseConfig();
                    setShowConfigModal(false);
                    checkFirebase();
                    alert('Firebase configuration cleared.');
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  Clear Config
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 shadow-sm cursor-pointer"
                  >
                    Save & Test
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
