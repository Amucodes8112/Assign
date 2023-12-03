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
            <td>{renderCell(member.name, 'name', member.id)}</td>
            <td>{renderCell(member.email, 'email', member.id)}</td>
            <td>{renderCell(member.role, 'role', member.id)}</td>
            <td>
              {renderActions(member)}
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  const renderCell = (value, field, memberId) => {
    if (editMode === memberId) {
      return <input
        type="text"
        value={value}
        onChange={(e) => handleEditInputChange(e.target.value, field, memberId)}
      />;
    }
    return value;
  };

  const handleEditInputChange = (value, field, memberId) => {
    setFilteredMembers(prevFilteredMembers =>
      prevFilteredMembers.map(member => {
        if (member.id === memberId) {
          return { ...member, [field]: value };
        }
        return member;
      })
    );
  };

  const renderActions = (member) => {
    if (editMode === member.id) {
      return (
        <button onClick={() => saveRow(member)}>Save</button>
      );
    }
    return (
      <>
        <button onClick={() => enableEditMode(member)}>Edit</button>
        <button onClick={() => deleteRow(member.id)}>Delete</button>
      </>
    );
  };

  const enableEditMode = (member) => {
    setEditMode(member.id);
  };

  const saveRow = (member) => {
    setEditMode(null);
  };

  const deleteRow = (id) => {
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
        // All rows on the current page are selected, so deselect all
        return [];
      } else {
        // Select all rows on the current page
        const pageStart = itemsPerPage * (currentPage - 1);
        const pageEnd = pageStart + itemsPerPage;
        const pageIds = filteredMembers.slice(pageStart, pageEnd).map(member => member.id);
        return [...new Set([...prevSelectedRows, ...pageIds])];
      }
    });
  };

  const handleDeleteAllInPage = () => {
    const pageStart = itemsPerPage * (currentPage - 1);
    const pageEnd = pageStart + itemsPerPage;
    const pageIds = filteredMembers.slice(pageStart, pageEnd).map(member => member.id);

    setMembersData(prevMembers => prevMembers.filter(member => !pageIds.includes(member.id)));
    setFilteredMembers(prevFilteredMembers => prevFilteredMembers.filter(member => !pageIds.includes(member.id)));
    setSelectedRows([]);
  };

  const handleDeleteSelected = () => {
    setMembersData(prevMembers =>
      prevMembers.filter(member => !selectedRows.includes(member.id))
    );
    setFilteredMembers(prevFilteredMembers =>
      prevFilteredMembers.filter(member => !selectedRows.includes(member.id))
    );
    setSelectedRows([]);
  };

  const selectedRowsCount = selectedRows.length;

  return (
    <div>
      <h2 style={styles.heading}>Admin Dashboard</h2>
      <div className="actions-bar" style={styles.actionsBar}>
        <div className="search-bar" style={styles.searchBar}>
          <label htmlFor="searchInput" style={styles.label}>Search: </label>
          <input type="text" id="searchInput" onChange={handleSearch} style={styles.input} />
        </div>
        <div className="delete-all-icon" style={styles.deleteAllIcon} onClick={handleDeleteAllInPage}>
          <img src="https://img.icons8.com/ios/50/000000/trash.png" alt="Delete All" />
        </div>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRowsCount === itemsPerPage * (currentPage - 1)}
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
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
  },
  deleteAllIcon: {
    cursor: 'pointer',
    width: '70px',
    height: '50px',
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
    cursor: 'pointer',
  },
};

export default MembersList;

