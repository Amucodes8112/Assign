import React, { useState, useEffect } from 'react';

const MembersList = () => {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [membersData, setMembersData] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

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
          <tr key={member.id}>
            <td>{member.id}</td>
            <td>{member.name}</td>
            <td>{member.email}</td>
            <td>{member.role}</td>
          </tr>
        ))}
      </tbody>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const paginationButtons = [];

    const addPaginationButton = (label, targetPage) => {
      paginationButtons.push(
        <a
          key={label}
          href="#"
          className={`page-link${currentPage === targetPage ? ' active' : ''}`}
          onClick={() => handlePageClick(targetPage)}
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

    return <div style={{ display: 'flex', marginTop: '10px' }}>{paginationButtons}</div>;
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

  return (
    <div>
      <h2>Members List</h2>
      <div className="search-bar">
        <label htmlFor="searchInput">Search: </label>
        <input type="text" id="searchInput" onChange={handleSearch} />
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        {renderTable(currentPage)}
      </table>
      {renderPagination()}
    </div>
  );
};

export default MembersList;