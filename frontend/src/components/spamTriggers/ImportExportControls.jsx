import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { spamTriggerService } from "../../services/spamTriggerService";
import { fileUtils } from "../../utils/fileUtils";

const ImportExportControls = ({ onImportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFormat, setImportFormat] = useState("json");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setImportError("");

      if (format === "json") {
        const data = await spamTriggerService.exportToJson();
        fileUtils.downloadJson(data, "spam-triggers.json");
      } else if (format === "csv") {
        const blob = await spamTriggerService.exportToCsv();
        fileUtils.downloadCsv(blob, "spam-triggers.csv");
      }
    } catch (error) {
      console.error("Export error:", error);
      setImportError("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = (format) => {
    setImportFormat(format);
    setImportError("");
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportError("");

      if (importFormat === "json") {
        const content = await fileUtils.readFileAsText(file);
        const jsonData = JSON.parse(content);
        await spamTriggerService.importFromJson(jsonData);
      } else if (importFormat === "csv") {
        const formData = new FormData();
        formData.append("file", file);
        await spamTriggerService.importFromCsv(formData);
      }

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportError(
        error.message ||
          "Failed to import data. Please check the file format and try again."
      );
    } finally {
      setIsImporting(false);
      // Reset file input
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={importFormat === "json" ? ".json" : ".csv"}
        className="hidden"
      />

      <div className="flex space-x-2">
        <span className="text-sm font-medium text-gray-700">Export:</span>
        <button
          onClick={() => handleExport("json")}
          disabled={isExporting}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          JSON
        </button>
        <span className="text-gray-500">|</span>
        <button
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          CSV
        </button>
      </div>

      <div className="flex space-x-2">
        <span className="text-sm font-medium text-gray-700">Import:</span>
        <button
          onClick={() => handleImportClick("json")}
          disabled={isImporting}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          JSON
        </button>
        <span className="text-gray-500">|</span>
        <button
          onClick={() => handleImportClick("csv")}
          disabled={isImporting}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          CSV
        </button>
      </div>

      {isExporting && (
        <span className="text-sm text-gray-600">Exporting...</span>
      )}
      {isImporting && (
        <span className="text-sm text-gray-600">Importing...</span>
      )}
      {importError && (
        <span className="text-sm text-red-500">{importError}</span>
      )}
    </div>
  );
};

ImportExportControls.propTypes = {
  onImportComplete: PropTypes.func,
};

export default ImportExportControls;
