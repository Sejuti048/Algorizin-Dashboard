import React, { useEffect, useState } from 'react';
import { renderComponent } from '../components/render/renderComponent';
import SingleQuesElement from '../components/SingleQuesElement';
import VideoCard from '../components/VideoCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import Topbar from '../components/topbar/Topbar';
// data 
import listViewComponents from '../data/quesDatabase.json';
import jsonQuestions from '../data/questions.json';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import { useRouter } from "next/router";
import Loader from "../components/Loader";
import SelectDropdownFilter from '../components/SelectDropdownFilter';
import PopupVideo from '../components/PopupVideo';
import { hasCookie, setCookie } from 'cookies-next';

const Questions = () => {
    const [allQuestions, setAllQuestions] = useState({});
    const [noOfQUes, setNoOfQUes] = useState('');
    const [allCategories, setCategory] = useState({});
    const [page, setPage] = useState(1);
    const [ShowPopupState, setShowPopupState] = useState(false);
    const [filterNameAndValue, setFilterNameAndValue] = useState({});
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    // get FormData 
    const getQuestionsData = async (pageNo, filterName, filter) => {
        try {
            
            let url = '/api/question_bank?page=1';
            if(filterName){
                url += `?${filterName.toLowerCase()}=${filter}`;
            }
            if (pageNo && url.includes('?')) {
                url += `&page=${pageNo}`;
            }
            else if (pageNo) {
                url += `?page=${pageNo}`;
            }
            //const res = await axios.get(filterName ? `/api/question_bank?${filterName.toLowerCase()}=${filter}` : `/api/question_bank?page=${pageNo ? pageNo : 1}`); // API
            const res = await axios.get(url); // API
            setAllQuestions(res?.data);
            setNoOfQUes(res?.data?.total);
            setCategory(res?.data?.categories);
            console.log(res?.data);
            
        } catch (err) {
            console.log(err)
        }
    };
    useEffect(() => {
        getQuestionsData();
    }, []);

    const sortOptionData = listViewComponents?.pages

    const questionList = allQuestions?.questions
    const categoryList = allCategories?.categories

    const videoQuestions = questionList?.filter(item => item?.video !== null)

    const handleSavePost = async (postId, saved) => {
        try {
            if (saved) {
                const res = await axios.post("/api/question_bank/save", { question_id: postId });
                console.log('saved')
                //saved notify user
            } else {
                await axios.delete(`/api/question_bank/save`, { data: { question_id: postId } });
                console.log('deleted')
                //deleted notify user
            }
        } catch (err) { console.log(err) }
    };

    // pagination
    function handlePaginationChange(e, value) {
        setPage(value);
        getQuestionsData(value)
    }

    useEffect(() => {
        if (router.query.page) {
            setPage(parseInt(router.query.page));
        }
    }, [router.query.page]);

    const dummyChoices = [
        [
            "Role",
            "Full Stack Developer",
            "Data Analyst",
            "Data Scientist"
        ],
        [
            "Category",
            "JavaScript",
            "Behavioral",
            "React",
            "Nodejs",
            "MongoDB"
        ]
    ]
    
  // vdo popup
  const videoPopupHideHandler = async () => {
    try {
        setCookie('intro-video', 'seen', { path: '/', maxAge: 60 * 60 * 24 * 365 });
        // const res = await axios.post("/api/videoPopupStatusHandler");
        // console.log(res)
    } catch (err) { console.log(err) }
}

useEffect(() => {
    const videoPopupShowHandler = async () => {
        try {
            // const res = await axios.get("/api/videoPopupStatusHandler");
            // setShowPopupState(res?.showPopup)
            const cookie = hasCookie('intro-video')
            console.log(cookie);
            setShowPopupState(!cookie)
        } catch (err) { console.log(err) }
    }
    videoPopupShowHandler()
}, [])


    return (
        <>
            <Head>
                <title>Interview Questions - Algorizin</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <Topbar />
            <PopupVideo embedId='4HavGGz0iME' videoPopupHideHandler={videoPopupHideHandler} ShowPopupState={ShowPopupState} />
            <div className='py-4 px-3 md:p-4 max-w-5xl mx-auto'>
                <div className='py-2 text-gray-800 text-center md:text-left'>
                    <h1 className='text-xl md:text-4xl font-bold'>Interview Questions</h1>
                    <p className='py-2 text-sm md:text-xl font-semibold text-gray-600'>
                        Prepare for interviews with our list of {noOfQUes} interview questions
                    </p>
                </div>
                <div className='w-full top-box flex flex-row items-center'>
                    {
                        // sortOptionData.map(p => renderComponent(p))
                    }
                    {dummyChoices.map((item, idx) => (
                        <SelectDropdownFilter key={idx} choices={item} filter={true} getQuestionsData={getQuestionsData} />
                    ))}

                </div>
                {loading ? <Loader text={"Loading..."} /> :
                    <>
                        <div className='hidden lg:flex flex-row flex-wrap items-stretch justify-between md:mt-2'>
                            {videoQuestions?.slice(0, 4).map(question => (
                                <VideoCard key={question.id} data={question} />
                            ))}
                        </div>
                        <div>
                            <table className="w-full font-inter my-1">
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {questionList?.map((question) => (
                                        <SingleQuesElement key={question.id} question={question} handleSavePost={handleSavePost} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <ol>
                        {categoryList?.map((category => <li key={category}>{category}</li>
                        ))}
                        </ol>
                    </>}
                <div className="w-full py-3 md:pr-2 flex justify-end">
                    <Pagination
                        count={Math.ceil(jsonQuestions?.count/10)}
                        variant='outlined'
                        color='primary'
                        className='pagination'
                        shape="rounded"
                        page={page}
                        onChange={handlePaginationChange}
                    />
                </div>
            </div>
        </>
    );
};

export default Questions;
