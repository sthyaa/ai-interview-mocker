"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { chatSession } from '../../../utils/GeminiAIModal';
import { LoaderCircle } from 'lucide-react';
import { MockInterview } from '../../../utils/schema';
import {db} from '../../../utils/db';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';


function AddNewInterview() {
  const [openDailog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState();
  const [jobDesc, setJobDesc] = useState();
  const [jobExperience, setJobExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();

    console.log(jobPosition, jobDesc, jobExperience);

    const InputPrompt =
      "Job position: " + jobPosition +
      " ,Job Description: " + jobDesc +
      " , Years of Experience: " + jobExperience +
      ", Depends on Job Position , Job Description & Years of experience give us " +
      process.env.NEXT_PUBLIC_INTERVIEW_QUESTION +
      " interview question along with Answer in JSON format , Give us question and answer field on JSON";

      const result=await chatSession.sendMessage(InputPrompt);

      const MockJsonResp = (result.response.text()).replace('```json','').replace('```','');
      console.log(JSON. parse(MockJsonResp));
      setJsonResponse(MockJsonResp);
      
      if(MockJsonResp){
      const resp = await db.insert(MockInterview)
      .values({
        mockId:uuidv4(),
        jsonMockResp :MockJsonResp,
        jobPosition:jobPosition,
        jobDesc:jobDesc,
        jobExperience:jobExperience,
        createdBy:user?.primaryEmailAddress?.emailAddress,
        createdAt:moment().format('DD-MM-yyyy')
      }).returning({mockId:MockInterview.mockId})

      console.log("Inserted ID:",resp)
      if(resp){
        setOpenDailog(false);
        router.push('/dashboard/interview/'+resp[0]?.mockId)
      }
    }
    else{
      console.log("ERROR");
    }
      setLoading(false);
  }


  return (
    <div>
      <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer
        transition-all'
        onClick={() => setOpenDailog(true)}
      >
        <h2 className='text-lg text-center'>+ Add New</h2>
      </div>

      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about your job interviewing</DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div>
                  <h2>Add Details about your job position/role , Job Description and years of experience</h2>
                  <div className='mt-7 my-3'>
                    <label>Job Role/Job Position</label>
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>
                  <div className='my-3'>
                    <label>Job Description / Tech Stack (In short)</label>
                    <Textarea
                      placeholder="Ex. React, Angular, NodeJs, MySql etc"
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>
                  <div className='my-3'>
                    <label>Years of experience</label>
                    <Input
                      placeholder="Ex.5"
                      type="number"
                      max="100"
                      required
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>
                </div>
                <div className='flex gap-5 justify-end'>
                  <Button type="button" variant="ghost" onClick={() => setOpenDailog(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ?
                      <>
                        <LoaderCircle className='animate-spin' /> Generating from AI
                      </> : 'Start Interview'}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
