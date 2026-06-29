import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './about-author.module.css';

const expertise = [
  'Artificial Intelligence (AI)',
  'Agentic AI & AI Agents',
  'Prompt & Context Engineering',
  'Model Context Protocol (MCP)',
  'Retrieval-Augmented Generation (RAG)',
  'Workflow Automation (n8n)',
  'Python Development',
  'Laravel & Full-Stack Development',
];

const projects = [
  {
    name: 'Digital FTE (Autonomous AI Employee)',
    desc: 'An autonomous AI employee capable of automating business and personal tasks using intelligent agents.',
  },
  {
    name: 'AI Automation & Workflow Systems',
    desc: 'End-to-end workflow automation pipelines integrating AI agents with business processes.',
  },
  {
    name: 'Physical AI & Humanoid Robotics Educational Platform',
    desc: 'Educational platform teaching Physical AI and humanoid robotics concepts.',
  },
  {
    name: 'AI-Powered Learning Applications',
    desc: 'Applications like this book that use RAG and AI assistants to make learning more effective.',
  },
];

export default function AboutAuthor() {
  return (
    <Layout
      title="About the Author"
      description="Faizan Ali — Agentic AI Full Stack Developer and author of the Class 11 CS textbook.">
      <main className={styles.page}>
        <div className="container">

          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.avatarWrapper}>
              <img
                src="/img/author.jpg"
                alt="Faizan Ali — Author"
                className={styles.avatar}
              />
            </div>
            <div className={styles.heroText}>
              <Heading as="h1" className={styles.name}>Faizan Ali</Heading>
              <p className={styles.role}>Agentic AI Full Stack Developer &amp; Computer Science Graduate</p>
              <p className={styles.bio}>
                Faizan Ali is an Agentic AI Full Stack Developer and Computer Science graduate with
                expertise in Artificial Intelligence, AI Agents, MCP (Model Context Protocol), RAG
                (Retrieval-Augmented Generation), Workflow Automation, Laravel, Python, and
                Full-Stack Development.
              </p>
              <p className={styles.bio}>
                He has worked on several AI-powered projects, including the development of a Digital
                FTE (Autonomous AI Employee) capable of automating business and personal tasks using
                intelligent agents. His work focuses on building practical AI solutions that improve
                productivity and simplify complex workflows.
              </p>
              <p className={styles.bio}>
                Faizan is passionate about making advanced AI concepts easy to understand for
                students and beginners. Through this book, he aims to help learners explore
                Artificial Intelligence from both theoretical and practical perspectives, preparing
                them for the future of technology.
              </p>
            </div>
          </div>

          {/* Expertise + Projects */}
          <div className={styles.grid}>
            <div className={styles.card}>
              <Heading as="h2" className={styles.cardTitle}>🧠 Areas of Expertise</Heading>
              <ul className={styles.expertiseList}>
                {expertise.map((item, i) => (
                  <li key={i} className={styles.expertiseItem}>
                    <span className={styles.dot} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.card}>
              <Heading as="h2" className={styles.cardTitle}>🚀 Notable Projects</Heading>
              <div className={styles.projectList}>
                {projects.map((p, i) => (
                  <div key={i} className={styles.projectItem}>
                    <p className={styles.projectName}>{p.name}</p>
                    <p className={styles.projectDesc}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </Layout>
  );
}
