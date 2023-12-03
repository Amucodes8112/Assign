import React, { useState, useEffect } from 'react';

const MembersList = () => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [membersData, setMembersData] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editMode, setEditMode] = useState(null);

  useEffect(() => {
    fetchDataAndPopulateTable();
  }, []);

  const fetchDataAndPopulateTable = () => {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setMembersData(data);
        setFilteredMembers([...data]);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const renderTable = (page) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageMembers = filteredMembers.slice(start, end);

    return (
      <tbody>
        {pageMembers.map(member => (
          <tr
            key={member.id}
            style={{
              backgroundColor: selectedRows.includes(member.id) ? '#d9d9d9' : 'inherit',
            }}
          >
            <td>
              <input
                type="checkbox"
                checked={selectedRows.includes(member.id)}
                onChange={() => handleRowSelect(member.id)}
                style={styles.checkbox}
              />
            </td>
            <td>{member.id}</td>
            <td>{editMode === member.id ? renderEditableCell(member.name) : member.name}</td>
            <td>{editMode === member.id ? renderEditableCell(member.email) : member.email}</td>
            <td>{editMode === member.id ? renderEditableCell(member.role) : member.role}</td>
            <td>
              {editMode !== member.id && (
                <>
                  <button onClick={() => enableEditMode(member)}>Edit</button>
                  <button onClick={() => deleteRow(member.id)}>Delete</button>
                </>
              )}
              {editMode === member.id && (
                <button onClick={() => saveRow(member)}>Save</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  const renderEditableCell = (value) => (
    <input
      type="text"
      value={value}
      onChange={(e) => handleEditInputChange(e.target.value)}
    />
  );

  const handleEditInputChange = (value) => {
    console.log('Editing value:', value);
  };

  const enableEditMode = (member) => {
    setEditMode(member.id);
  };

  const saveRow = (member) => {
    console.log('Save row for member:', member);
    setEditMode(null);
  };

  const deleteRow = (id) => {
    console.log('Delete row for id:', id);
    setMembersData(prevMembers => prevMembers.filter(member => member.id !== id));
    setFilteredMembers(prevFilteredMembers => prevFilteredMembers.filter(member => member.id !== id));
    setSelectedRows(prevSelectedRows => prevSelectedRows.filter(rowId => rowId !== id));
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const paginationButtons = [];

    const addPaginationButton = (label, targetPage) => {
      paginationButtons.push(
        <a
          key={label}
          href="#"
          className={`pagination-button${currentPage === targetPage ? ' active' : ''}`}
          onClick={() => handlePageClick(targetPage)}
          style={styles.paginationButton}
        >
          {label}
        </a>
      );
    };

    addPaginationButton('First', 1);
    addPaginationButton('Previous', currentPage - 1);

    for (let i = 1; i <= totalPages; i++) {
      addPaginationButton(i, i);
    }

    addPaginationButton('Next', currentPage + 1);
    addPaginationButton('Last', totalPages);

    return <div style={styles.pagination}>{paginationButtons}</div>;
  };

  const handlePageClick = (targetPage) => {
    if (targetPage >= 1 && targetPage <= Math.ceil(filteredMembers.length / itemsPerPage)) {
      setCurrentPage(targetPage);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();

    setFilteredMembers(
      membersData.filter(member =>
        member.id.toLowerCase().includes(searchTerm) ||
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm) ||
        member.role.toLowerCase().includes(searchTerm)
      )
    );

    setCurrentPage(1);
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prevSelectedRows => {
      if (prevSelectedRows.includes(id)) {
        // Deselect the row
        return prevSelectedRows.filter(rowId => rowId !== id);
      } else {
        // Select the row
        return [...prevSelectedRows, id];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedRows(prevSelectedRows => {
      if (prevSelectedRows.length === itemsPerPage * (currentPage - 1)) {
        // Deselect all rows on the current page
        return prevSelectedRows.filter(rowId => rowId < itemsPerPage * (currentPage - 1) + itemsPerPage);
      } else {
        // Select all rows on the current page
        return [...Array(itemsPerPage * currentPage).keys()];
      }
    });
  };

  const selectedRowsCount = selectedRows.length;

  const handleDeleteSelected = () => {
    console.log('Deleting selected rows:', selectedRows);
    // You can implement the logic to delete selected rows here
    // For now, it will just clear the selection
    setSelectedRows([]);
  };

  return (
    <div>
      <h2 style={styles.heading}>Members List</h2>
      <div className="search-bar" style={styles.searchBar}>
        <label htmlFor="searchInput" style={styles.label}>Search: </label>
        <input type="text" id="searchInput" onChange={handleSearch} style={styles.input} />
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                style={styles.checkbox}
              />
            </th>
            <th style={styles.header}>ID</th>
            <th style={styles.header}>Name</th>
            <th style={styles.header}>Email</th>
            <th style={styles.header}>Role</th>
            <th style={styles.header}>Actions</th>
          </tr>
        </thead>
        {renderTable(currentPage)}
      </table>
      {renderPagination()}
      <div style={styles.selectedRowsInfo}>
        {selectedRowsCount > 0 && `Selected Rows: ${selectedRowsCount} out of ${filteredMembers.length}`}
      </div>
      <button onClick={handleDeleteSelected} disabled={selectedRowsCount === 0} style={styles.paginationButton}>
        Delete Selected
      </button>
    </div>
  );
};

const styles = {
  heading: {
    textAlign: 'center',
    color: '#007bff',
  },
  searchBar: {
    marginTop: '10px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    marginRight: '10px',
    fontWeight: 'bold',
  },
  input: {
    padding: '5px',
    fontSize: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  },
  cell: {
    borderBottom: '1px solid #ddd',
    padding: '10px',
  },
  pagination: {
    display: 'flex',
    marginTop: '10px',
    marginLeft: '10px',
    justifyContent: 'flex-start',
  },
  paginationButton: {
    padding: '8px',
    margin: '0 3px',
    textDecoration: 'none',
    color: '#007bff',
    border: '1px solid #007bff',
    cursor: 'pointer',
  },
  selectedRowsInfo: {
    textAlign: 'right',
    marginTop: '10px',
    marginRight: '10px',
    color: '#555',
  },
  checkbox: {
    backgroundColor: '#007bff',
  },
};

export default MembersList;
