import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react';
import { useAppContext } from '../../context/Appcontext';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
interface Thread {
    _id: string;
    title: string;
    createdAt: string;
}

const Category = () => {
    const { categoryId } = useParams();
    const [threads, setThreads] = useState<Thread[]>([]);
    const { loading, setLoading, error, setError } = useAppContext();

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5000/api/categories/${categoryId}/threads`)
        .then((response) => {
            setThreads(response.data);
        })
        .catch((error) => {
            console.error('スレッド一覧の取得に失敗:', error);
        })
    }, []);
  return (
    <Box>
        <Typography variant="h4">スレッド一覧</Typography>
        {threads.map((thread) => (
            <Box key={thread._id} component={Link} to={`/thread/${thread._id}`}>
                <Typography variant="h5">{thread.title}</Typography>
            </Box>
        ))}
    </Box>  
  )
}

export default Category
