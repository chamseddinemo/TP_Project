import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Exporte des données en PDF
 * @param {Array} data - Données à exporter (tableau d'objets)
 * @param {Array} columns - Colonnes à afficher [{key: 'nom', label: 'Nom'}]
 * @param {String} filename - Nom du fichier (sans extension)
 * @param {String} title - Titre du document
 */
export const exportToPDF = (data, columns, filename, title = 'Export') => {
  if (!data || data.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(18);
  doc.text(title, 14, 15);
  
  // Date
  const date = new Date().toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré le ${date}`, 14, 22);
  
  // Préparer les données pour le tableau
  const tableData = data.map(item => 
    columns.map(col => {
      // Utiliser l'accessor si fourni
      if (col.accessor && typeof col.accessor === 'function') {
        const value = col.accessor(item);
        if (value === null || value === undefined) return '';
        return String(value);
      }
      
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      
      // Gérer les dates
      if (value instanceof Date) {
        return value.toLocaleDateString('fr-CA');
      }
      
      // Gérer les objets (ex: client.name)
      if (typeof value === 'object' && value !== null) {
        return value.name || value.label || JSON.stringify(value);
      }
      
      return String(value);
    })
  );

  const tableColumns = columns.map(col => col.label);

  // Générer le tableau
  autoTable(doc, {
    head: [tableColumns],
    body: tableData,
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 28 },
  });

  // Sauvegarder le PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Exporte des données en Excel
 * @param {Array} data - Données à exporter (tableau d'objets)
 * @param {Array} columns - Colonnes à afficher [{key: 'nom', label: 'Nom'}]
 * @param {String} filename - Nom du fichier (sans extension)
 * @param {String} sheetName - Nom de la feuille
 */
export const exportToExcel = (data, columns, filename, sheetName = 'Export') => {
  if (!data || data.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  // Préparer les données
  const worksheetData = [
    // En-têtes
    columns.map(col => col.label),
    // Données
    ...data.map(item =>
      columns.map(col => {
        // Utiliser l'accessor si fourni
        if (col.accessor && typeof col.accessor === 'function') {
          const value = col.accessor(item);
          if (value === null || value === undefined) return '';
          return value;
        }
        
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        
        // Gérer les dates
        if (value instanceof Date) {
          return value.toLocaleDateString('fr-CA');
        }
        
        // Gérer les objets (ex: client.name)
        if (typeof value === 'object' && value !== null) {
          return value.name || value.label || '';
        }
        
        return value;
      })
    ),
  ];

  // Créer le workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Style des en-têtes (largeur des colonnes)
  const colWidths = columns.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Sauvegarder le fichier
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Exporte un tableau HTML en PDF
 * @param {String} tableId - ID de l'élément table HTML
 * @param {String} filename - Nom du fichier (sans extension)
 * @param {String} title - Titre du document
 */
export const exportTableToPDF = (tableId, filename, title = 'Export') => {
  const table = document.getElementById(tableId);
  if (!table) {
    throw new Error('Tableau non trouvé');
  }

  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(18);
  doc.text(title, 14, 15);
  
  // Date
  const date = new Date().toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré le ${date}`, 14, 22);

  // Convertir le tableau HTML en données pour autoTable
  const headers = [];
  const rows = [];

  const headerCells = table.querySelectorAll('thead th');
  headerCells.forEach(cell => {
    headers.push(cell.textContent.trim());
  });

  const bodyRows = table.querySelectorAll('tbody tr');
  bodyRows.forEach(row => {
    const rowData = [];
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      rows.push(rowData);
    }
  });

  // Générer le tableau
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 28 },
  });

  // Sauvegarder le PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Exporte un tableau HTML en Excel
 * @param {String} tableId - ID de l'élément table HTML
 * @param {String} filename - Nom du fichier (sans extension)
 * @param {String} sheetName - Nom de la feuille
 */
export const exportTableToExcel = (tableId, filename, sheetName = 'Export') => {
  const table = document.getElementById(tableId);
  if (!table) {
    throw new Error('Tableau non trouvé');
  }

  // Extraire les données du tableau
  const worksheetData = [];
  
  // En-têtes
  const headers = [];
  const headerCells = table.querySelectorAll('thead th');
  headerCells.forEach(cell => {
    headers.push(cell.textContent.trim());
  });
  worksheetData.push(headers);

  // Données
  const bodyRows = table.querySelectorAll('tbody tr');
  bodyRows.forEach(row => {
    const rowData = [];
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      worksheetData.push(rowData);
    }
  });

  // Créer le workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Largeur des colonnes
  const colWidths = headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Sauvegarder le fichier
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

