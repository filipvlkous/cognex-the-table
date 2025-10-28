import React, { useEffect, useState, useRef, FC } from 'react';
import { Link } from 'react-router-dom';
import ConnectionManagerView from '../components/test';
import { ArrowBigLeft } from 'lucide-react';

const Settings: FC = () => {
  return (
    <div>
      <Link
        style={{
          marginLeft: '23px',
          marginTop: '10px',
          display: 'flex',
          borderWidth: 1,
          border: '1 solid black',
          paddingInline: 10,
          paddingBlock: 5,
          borderRadius: 10,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: 'fit-content',
          // borderRadius: 1,
        }}
        to="/"
      >
        <ArrowBigLeft />
        <p>Back </p>
      </Link>

      <ConnectionManagerView />
    </div>
  );
};

export default Settings;
