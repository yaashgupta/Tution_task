"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface Student {
  id: number;
  student_name: string;
  english: number;
  math: number;
  hindi: number;
  science: number;
  social_science: number;
}

interface FormData {
  student_name: string;
  english: number;
  math: number;
  hindi: number;
  science: number;
  social_science: number;
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<FormData>({
    student_name: "",
    english: 0,
    math: 0,
    hindi: 0,
    science: 0,
    social_science: 0,
  });
  const [submittedMarksheets, setSubmittedMarksheets] = useState<FormData[]>([]);
  const [percentages, setPercentages] = useState({
    english: 0,
    math: 0,
    hindi: 0,
    science: 0,
    social_science: 0,
  });

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const res = await axios.get<Student[]>("http://localhost:5000/api/marks");
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching marks:", error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "student_name") {
      setFormData({ ...formData, [name]: value });
    } else {
      const numValue = Math.min(Number(value), 100);
      if (numValue >= 0 && numValue <= 100) {
        setFormData({ ...formData, [name]: numValue });
        setPercentages({ ...percentages, [name]: (numValue / 100) * 100 });
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/marks", formData);
      fetchMarks();
      setSubmittedMarksheets([...submittedMarksheets, formData]);
      resetForm();
    } catch (error) {
      console.error("Error submitting marks:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      student_name: "",
      english: 0,
      math: 0,
      hindi: 0,
      science: 0,
      social_science: 0,
    });
  };

  const calculateRankings = () => {
    return [...students].sort((a, b) => {
      const totalA = Object.values(a)
        .slice(2)
        .reduce((sum, mark) => sum + (typeof mark === "number" ? mark : 0), 0);
      const totalB = Object.values(b)
        .slice(2)
        .reduce((sum, mark) => sum + (typeof mark === "number" ? mark : 0), 0);
      return totalB - totalA;
    });
  };

  const getSubjectToppers = () => {
    const toppers: { [key: string]: { names: string[]; score: number } } = {
      english: { names: [], score: -1 },
      math: { names: [], score: -1 },
      hindi: { names: [], score: -1 },
      science: { names: [], score: -1 },
      social_science: { names: [], score: -1 },
    };

    students.forEach((student) => {
      Object.keys(toppers).forEach((subject) => {
        const score = student[subject as keyof Student];
        if (typeof score === "number") {
          if (score > toppers[subject].score) {
            toppers[subject] = { names: [student.student_name], score: score };
          } else if (score === toppers[subject].score) {
            toppers[subject].names.push(student.student_name);
          }
        }
      });
    });

    return toppers;
  };

  const rankings = calculateRankings();
  const toppers = getSubjectToppers();

  return (
    <div className="container">
      <h1 className="title">Tuition Class Marks Input</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="studentNameContainer">
          <input
            type="text"
            name="student_name"
            placeholder="Student Name"
            value={formData.student_name}
            onChange={handleChange}
            className="input studentNameInput"
            required
          />
        </div>

        <table className="formTable">
          <thead>
            <tr>
              <th>Subjects</th>
              <th>Maximum Marks</th>
              <th>Marks Obtained</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {["english", "math", "hindi", "science", "social_science"].map((subject) => (
              <tr key={subject}>
                <td>{subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' ')}</td>
                <td>100</td>
                <td>
                  <input
                    type="number"
                    name={subject}
                    placeholder={subject.charAt(0).toUpperCase() + subject.slice(1)}
                    value={formData[subject as keyof FormData]}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </td>
                <td>{percentages[subject as keyof typeof percentages].toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="buttonGroup">
          <button type="submit" className="buttonSubmit">
            Submit
          </button>
          <button type="button" className="buttonReset" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      {/* Display all submitted marksheets */}
      {submittedMarksheets.map((marksheet, index) => (
        <div key={index}>
          <h2 className="subtitle">{marksheet.student_name}&apos;s Marksheet</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Subjects</th>
                <th>Maximum Marks</th>
                <th>Marks Obtained</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {["english", "math", "hindi", "science", "social_science"].map((subject) => {
                const marks = marksheet[subject as keyof FormData] as number;
                return (
                  <tr key={subject}>
                    <td>{subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' ')}</td>
                    <td>100</td>
                    <td>{marks}</td>
                    <td>{(marks / 100 * 100).toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <h2 className="subtitle">Overall Rankings</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student Name</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.student_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="subtitle">Topper of Each Subject</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Topper</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(toppers).map((subject) => (
            <tr key={subject}>
              <td>{subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' ')}</td>
              <td>{toppers[subject].names.length > 0 ? toppers[subject].names.join(" / ") : "No entries"}</td>
              <td>{toppers[subject].score > -1 ? toppers[subject].score : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
