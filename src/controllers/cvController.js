// src/controllers/cvController.js
const connection = require("../config/dbconfig");
const { validationResult } = require("express-validator");

// CREATE a new CV
exports.createCV = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const {
    cv_unique_id,
    cv_info,
    template_visibility = "Private",
    // template_image,
  } = req.body;
  const user = cv_info.user;

  try {
    // Insert CV data first to get cv_id
    const [cvResult] = await connection.query("INSERT INTO cvs_data SET ?", {
      cv_unique_id,
      auth_user_id: req.user.id,
      hobbies: cv_info.hobbies.description,
      template_visibility,
      // template_image,
    });

    const cv_id = cvResult.insertId;

    // Insert user data linked to cv_id
    const [userResult] = await connection.query("INSERT INTO user_data SET ?", {
      cv_id,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle,
      address: user.address,
      city: user.city,
      postal_code: user.postal_code,
      country: user.country,
      phone: user.phone,
      email: user.email,
      date_of_birth: user.date_of_birth,
      place_of_birth: user.place_of_birth,
      nationality: user.nationality,
      summary: user.summary,
      template_id: user.template_id,
    });

    // Insert employment history
    if (cv_info.employment_history && cv_info.employment_history.length > 0) {
      const employmentData = cv_info.employment_history.map((job) => [
        cv_id,
        job.jobTitle,
        job.employer,
        job.city,
        job.description,
        job.start_date,
        job.end_date,
        job.is_current,
      ]);

      await connection.query(
        "INSERT INTO employment_history (cv_id, jobTitle, employer, city, description, start_date, end_date, is_current) VALUES ?",
        [employmentData]
      );
    }

    // Insert education data
    if (cv_info.education && cv_info.education.length > 0) {
      const educationData = cv_info.education.map((edu) => [
        cv_id,
        edu.degree,
        edu.school_name,
        edu.city,
        edu.start_date,
        edu.end_date,
        edu.description,
      ]);

      await connection.query(
        "INSERT INTO education (cv_id, degree, school_name, city, start_date, end_date, description) VALUES ?",
        [educationData]
      );
    }

    // Insert courses data
    if (cv_info.courses && cv_info.courses.length > 0) {
      const coursesData = cv_info.courses.map((course) => [
        cv_id,
        course.title,
        course.institution,
        course.start_date,
        course.end_date,
      ]);

      await connection.query(
        "INSERT INTO courses (cv_id, title, institution, start_date, end_date) VALUES ?",
        [coursesData]
      );
    }

    // Insert skills data
    if (cv_info.skills && cv_info.skills.length > 0) {
      const skillsData = cv_info.skills.map((skill) => [
        cv_id,
        skill.skill,
        skill.proficiency,
      ]);

      await connection.query(
        "INSERT INTO skills (cv_id, skill, proficiency) VALUES ?",
        [skillsData]
      );
    }

    // Insert languages data
    if (cv_info.languages && cv_info.languages.length > 0) {
      const languagesData = cv_info.languages.map((language) => [
        cv_id,
        language.language,
        language.proficiency,
      ]);

      await connection.query(
        "INSERT INTO languages (cv_id, language, proficiency) VALUES ?",
        [languagesData]
      );
    }

    // Insert internships data
    if (cv_info.internships && cv_info.internships.length > 0) {
      const internshipsData = cv_info.internships.map((internship) => [
        cv_id,
        internship.jobTitle,
        internship.company,
        internship.city,
        internship.description,
        internship.start_date,
        internship.end_date,
      ]);

      await connection.query(
        "INSERT INTO internships (cv_id, jobTitle, company, city, description, start_date, end_date) VALUES ?",
        [internshipsData]
      );
    }

    // Insert links data
    if (cv_info.links && cv_info.links.length > 0) {
      const linksData = cv_info.links.map((link) => [
        cv_id, // Link each link to the CV
        link.label,
        link.url,
      ]);

      await connection.query("INSERT INTO links (cv_id, label, url) VALUES ?", [
        linksData,
      ]);
    }

    res
      .status(201)
      .json({ message: "CV and related data created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating CV with relational data" });
  }
};

// GET all CVs for the authenticated user
exports.getAllCVs = async (req, res) => {
  try {
    const [cvs] = await connection.query(
      `
      SELECT 
        cvs_data.cv_id, 
        cvs_data.cv_unique_id,
        cvs_data.created_at, 
        cvs_data.hobbies,
        cvs_data.template_visibility,
        user_data.firstName, 
        user_data.lastName, 
        user_data.jobTitle,
        user_data.address, 
        user_data.city, 
        user_data.postal_code, 
        user_data.country, 
        user_data.phone, 
        user_data.email, 
        user_data.date_of_birth, 
        user_data.place_of_birth, 
        user_data.nationality, 
        user_data.summary, 
        user_data.template_id
      FROM cvs_data
      INNER JOIN user_data ON cvs_data.cv_id = user_data.cv_id
      WHERE cvs_data.auth_user_id = ?
    `,
      [req.user.id]
    );

    if (cvs.length === 0) {
      return res.status(404).json({ message: "No CVs found for the user" });
    }

    // Fetching relational data using cv_id
    const cvIds = cvs.map((cv) => cv.cv_id);

    // Fetch employment history, education, courses, skills, languages, internships, and links
    const [employmentHistory] = await connection.query(
      `
      SELECT cv_id,employment_id, jobTitle, employer, city, description, start_date, end_date, is_current
      FROM employment_history
      WHERE cv_id IN (?)
    `,
      [cvIds]
    );

    const [education] = await connection.query(
      `
      SELECT cv_id,education_id, degree, school_name, city, start_date, end_date, description
      FROM education
      WHERE cv_id IN (?)
    `,
      [cvIds]
    );

    const [courses] = await connection.query(
      `
      SELECT cv_id, course_id, title, institution, start_date, end_date
      FROM courses
      WHERE cv_id IN (?)
    `,
      [cvIds]
    );

    const [skills] = await connection.query(
      `
      SELECT cv_id, skill_id, skill, proficiency
      FROM skills
      WHERE cv_id IN (?)
    `,
      [cvIds]
    );

    const [languages] = await connection.query(
      `
      SELECT cv_id, language_id, language, proficiency
      FROM languages
      WHERE cv_id IN (?)
    `,
      [cvIds]
    );

    const [internships] = await connection.query(
      `
      SELECT cv_id, internship_id, jobTitle, company, city, description, start_date, end_date
      FROM internships
      WHERE cv_id IN (?)
    `,
      [cvIds]
    );

    const [links] = await connection.query(
      `
      SELECT cv_id,link_id, label, url
      FROM links
      WHERE cv_id IN (?)
    `,
      [cvIds]
    );

    // Structure each CV data object with relational data
    const cvMap = {};
    cvs.forEach((cv) => {
      cvMap[cv.cv_id] = {
        cv_id: cv.cv_id,
        cv_unique_id: cv.cv_unique_id,
        created_at: cv.created_at,
        template_visibility: cv.template_visibility,
        hobbies: cv.hobbies,
        user: {
          firstName: cv.firstName,
          lastName: cv.lastName,
          jobTitle: cv.jobTitle,
          address: cv.address,
          city: cv.city,
          postal_code: cv.postal_code,
          country: cv.country,
          phone: cv.phone,
          email: cv.email,
          date_of_birth: cv.date_of_birth,
          place_of_birth: cv.place_of_birth,
          nationality: cv.nationality,
          summary: cv.summary,
          template_id: cv.template_id,
        },
        employment_history: [],
        education: [],
        courses: [],
        skills: [],
        languages: [],
        internships: [],
        links: [],
      };
    });

    // Attach relational data
    employmentHistory.forEach((job) =>
      cvMap[job.cv_id].employment_history.push(job)
    );
    education.forEach((edu) => cvMap[edu.cv_id].education.push(edu));
    courses.forEach((course) => cvMap[course.cv_id].courses.push(course));
    skills.forEach((skill) => cvMap[skill.cv_id].skills.push(skill));
    languages.forEach((language) =>
      cvMap[language.cv_id].languages.push(language)
    );
    internships.forEach((internship) =>
      cvMap[internship.cv_id].internships.push(internship)
    );
    links.forEach((link) => cvMap[link.cv_id].links.push(link));

    // Convert cvMap to array
    const result = Object.values(cvMap);

    // Final response with all related data
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error fetching CVs with relational data" });
  }
};

// GET a single CV by unique ID for the authenticated user
// exports.getCVById = async (req, res) => {
//   const { cv_unique_id } = req.params;
//   try {
//     // Fetch the main CV information and user data for the specified cv_unique_id
//     const [cvData] = await connection.query(
//       `
//       SELECT
//         cvs_data.cv_id,
//         cvs_data.template_visibility,
//         cvs_data.cv_unique_id,
//         user_data.firstName,
//         user_data.lastName,
//         user_data.jobTitle,
//         user_data.email,
//         user_data.address,
//         user_data.city,
//         user_data.postal_code,
//         user_data.country,
//         user_data.phone,
//         user_data.date_of_birth,
//         user_data.place_of_birth,
//         user_data.nationality,
//         user_data.summary,
//         user_data.template_id,
//         cvs_data.hobbies
//       FROM cvs_data
//       INNER JOIN user_data ON cvs_data.cv_id = user_data.cv_id
//       WHERE cvs_data.cv_unique_id = ? AND cvs_data.auth_user_id = ?
//     `,
//       [cv_unique_id, req?.user?.id]
//     );

//     if (cvData.length === 0) {
//       return res.status(404).json({ error: "CV not found" });
//     }

//     const cv = cvData[0];
//     const cv_id = cv.cv_id;

//     // Fetch employment history
//     const [employmentHistory] = await connection.query(
//       `
//       SELECT jobTitle, employer, city, description, start_date, end_date, is_current
//       FROM employment_history
//       WHERE cv_id = ?
//     `,
//       [cv_id]
//     );

//     // Fetch education
//     const [education] = await connection.query(
//       `
//       SELECT degree, school_name, city, start_date, end_date, description
//       FROM education
//       WHERE cv_id = ?
//     `,
//       [cv_id]
//     );

//     // Fetch courses
//     const [courses] = await connection.query(
//       `
//       SELECT title, institution, start_date, end_date
//       FROM courses
//       WHERE cv_id = ?
//     `,
//       [cv_id]
//     );

//     // Fetch skills
//     const [skills] = await connection.query(
//       `
//       SELECT skill, proficiency
//       FROM skills
//       WHERE cv_id = ?
//     `,
//       [cv_id]
//     );

//     // Fetch languages
//     const [languages] = await connection.query(
//       `
//       SELECT language, proficiency
//       FROM languages
//       WHERE cv_id = ?
//     `,
//       [cv_id]
//     );

//     // Fetch internships
//     const [internships] = await connection.query(
//       `
//       SELECT jobTitle, company, city, description, start_date, end_date
//       FROM internships
//       WHERE cv_id = ?
//     `,
//       [cv_id]
//     );

//     // Fetch links
//     const [links] = await connection.query(
//       `
//       SELECT label, url
//       FROM links
//       WHERE cv_id = ?
//     `,
//       [cv_id]
//     );

//     // Structure the response
//     const response = {
//       cv_id: cv_id,
//       cv_unique_id: cv.cv_unique_id,
//       template_visibility: cv.template_visibility,
//       user: {
//         firstName: cv.firstName,
//         lastName: cv.lastName,
//         jobTitle: cv.jobTitle,
//         email: cv.email,
//         address: cv.address,
//         city: cv.city,
//         postal_code: cv.postal_code,
//         country: cv.country,
//         phone: cv.phone,
//         date_of_birth: cv.date_of_birth,
//         place_of_birth: cv.place_of_birth,
//         nationality: cv.nationality,
//         summary: cv.summary,
//         template_id: cv.template_id,
//       },
//       hobbies: cv.hobbies,
//       employment_history: employmentHistory,
//       education: education,
//       courses: courses,
//       skills: skills,
//       languages: languages,
//       internships: internships,
//       links: links,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error fetching CV details" });
//   }
// };
exports.getCVById = async (req, res) => {
  const { cv_unique_id } = req.params;

  try {
    // Fetch the main CV details to check template visibility
    const [cvData] = await connection.query(
      `
      SELECT 
        cvs_data.cv_id,
        cvs_data.template_visibility,
        cvs_data.cv_unique_id
      FROM cvs_data
      WHERE cvs_data.cv_unique_id = ?
    `,
      [cv_unique_id]
    );

    if (cvData.length === 0) {
      return res.status(404).json({ error: "CV not found" });
    }

    const cv = cvData[0];
    const isPrivate = cv.template_visibility !== "Public";

    // Construct query dynamically based on visibility
    let query = `
      SELECT
        cvs_data.cv_id,
        cvs_data.template_visibility,
        cvs_data.cv_unique_id,
        user_data.firstName,
        user_data.lastName,
        user_data.jobTitle,
        user_data.email,
        user_data.address,
        user_data.city,
        user_data.postal_code,
        user_data.country,
        user_data.phone,
        user_data.date_of_birth,
        user_data.place_of_birth,
        user_data.nationality,
        user_data.summary,
        user_data.template_id,
        cvs_data.hobbies
      FROM cvs_data
      INNER JOIN user_data ON cvs_data.cv_id = user_data.cv_id
      WHERE cvs_data.cv_unique_id = ?
    `;

    // Only filter by user ID if CV is private
    let queryParams = [cv_unique_id];
    if (isPrivate) {
      query += " AND cvs_data.auth_user_id = ?";
      queryParams.push(req?.user?.id);
    }

    const [cvDetails] = await connection.query(query, queryParams);

    if (cvDetails.length === 0) {
      return res.status(404).json({ error: "CV not found or access denied" });
    }

    const cvDetail = cvDetails[0];
    const cv_id = cvDetail.cv_id;

    // Fetch additional CV sections
    const [employmentHistory] = await connection.query(
      `SELECT jobTitle, employer, city, description, start_date, end_date, is_current FROM employment_history WHERE cv_id = ?`,
      [cv_id]
    );

    const [education] = await connection.query(
      `SELECT degree, school_name, city, start_date, end_date, description FROM education WHERE cv_id = ?`,
      [cv_id]
    );

    const [courses] = await connection.query(
      `SELECT title, institution, start_date, end_date FROM courses WHERE cv_id = ?`,
      [cv_id]
    );

    const [skills] = await connection.query(
      `SELECT skill, proficiency FROM skills WHERE cv_id = ?`,
      [cv_id]
    );

    const [languages] = await connection.query(
      `SELECT language, proficiency FROM languages WHERE cv_id = ?`,
      [cv_id]
    );

    const [internships] = await connection.query(
      `SELECT jobTitle, company, city, description, start_date, end_date FROM internships WHERE cv_id = ?`,
      [cv_id]
    );

    const [links] = await connection.query(
      `SELECT label, url FROM links WHERE cv_id = ?`,
      [cv_id]
    );

    // Structure the response
    const response = {
      cv_id: cv_id,
      cv_unique_id: cvDetail.cv_unique_id,
      template_visibility: cvDetail.template_visibility,
      // template_image: cvDetail.template_image,
      user: {
        firstName: cvDetail.firstName,
        lastName: cvDetail.lastName,
        jobTitle: cvDetail.jobTitle,
        email: cvDetail.email,
        address: cvDetail.address,
        city: cvDetail.city,
        postal_code: cvDetail.postal_code,
        country: cvDetail.country,
        phone: cvDetail.phone,
        date_of_birth: cvDetail.date_of_birth,
        place_of_birth: cvDetail.place_of_birth,
        nationality: cvDetail.nationality,
        summary: cvDetail.summary,
        template_id: cvDetail.template_id,
      },
      hobbies: cvDetail.hobbies,
      employment_history: employmentHistory,
      education: education,
      courses: courses,
      skills: skills,
      languages: languages,
      internships: internships,
      links: links,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Error fetching CV details" });
  }
};

exports.getCVRecord = async (cv_unique_id) => {
  try {
    const [cvRecord] = await connection.query(
      `
      SELECT cv_id, template_visibility
      FROM cvs_data
      WHERE cv_unique_id = ?
      `,
      [cv_unique_id]
    );

    return cvRecord.length > 0 ? cvRecord[0] : null;
  } catch (error) {
    return null;
  }
};

exports.updateCV = async (req, res) => {
  const { cv_unique_id } = req.params;
  const { cv_info, template_visibility } = req.body;
  const user = cv_info?.user;

  try {
    // Fetch cv_id based on cv_unique_id and auth_user_id
    const [cvData] = await connection.query(
      "SELECT cv_id FROM cvs_data WHERE cv_unique_id = ? AND auth_user_id = ?",
      [cv_unique_id, req.user.id]
    );

    if (cvData.length === 0) {
      return res.status(404).json({ error: "CV not found" });
    }

    const cv_id = cvData[0].cv_id;

    // Update template visibility
    if (template_visibility) {
      await connection.query(
        "UPDATE cvs_data SET template_visibility = ? WHERE cv_id = ?",
        [template_visibility, cv_id]
      );
    }

    // Update user data
    if (cv_info?.user) {
      await connection.query("UPDATE user_data SET ? WHERE cv_id = ?", [
        {
          firstName: user.firstName,
          lastName: user.lastName,
          jobTitle: user.jobTitle,
          email: user.email,
          address: user.address,
          city: user.city,
          postal_code: user.postal_code,
          country: user.country,
          phone: user.phone,
          date_of_birth: user.date_of_birth,
          place_of_birth: user.place_of_birth,
          nationality: user.nationality,
          summary: user.summary,
          template_id: user.template_id,
        },
        cv_id,
      ]);
    }

    // Update hobbies
    if (cv_info?.hobbies) {
      await connection.query(
        "UPDATE cvs_data SET hobbies = ? WHERE cv_id = ?",
        [cv_info.hobbies.description, cv_id]
      );
    }

    // Update employment history
    if (cv_info?.employment_history) {
      await connection.query("DELETE FROM employment_history WHERE cv_id = ?", [
        cv_id,
      ]);
      const employmentData = cv_info.employment_history.map((job) => [
        cv_id,
        job.jobTitle,
        job.employer,
        job.city,
        job.description,
        job.start_date,
        job.end_date,
        job.is_current,
      ]);
      if (employmentData.length > 0) {
        await connection.query(
          "INSERT INTO employment_history (cv_id, jobTitle, employer, city, description, start_date, end_date, is_current) VALUES ?",
          [employmentData]
        );
      }
    }

    // Update education
    if (cv_info?.education) {
      await connection.query("DELETE FROM education WHERE cv_id = ?", [cv_id]);
      const educationData = cv_info.education.map((edu) => [
        cv_id,
        edu.degree,
        edu.school_name,
        edu.city,
        edu.start_date,
        edu.end_date,
        edu.description,
      ]);
      if (educationData.length > 0) {
        await connection.query(
          "INSERT INTO education (cv_id, degree, school_name, city, start_date, end_date, description) VALUES ?",
          [educationData]
        );
      }
    }

    // Update courses
    if (cv_info?.courses) {
      await connection.query("DELETE FROM courses WHERE cv_id = ?", [cv_id]);
      const coursesData = cv_info.courses.map((course) => [
        cv_id,
        course.title,
        course.institution,
        course.start_date,
        course.end_date,
      ]);
      if (coursesData.length > 0) {
        await connection.query(
          "INSERT INTO courses (cv_id, title, institution, start_date, end_date) VALUES ?",
          [coursesData]
        );
      }
    }

    // Update skills
    if (cv_info?.skills) {
      await connection.query("DELETE FROM skills WHERE cv_id = ?", [cv_id]);
      const skillsData = cv_info.skills.map((skill) => [
        cv_id,
        skill.skill,
        skill.proficiency,
      ]);
      if (skillsData.length > 0) {
        await connection.query(
          "INSERT INTO skills (cv_id, skill, proficiency) VALUES ?",
          [skillsData]
        );
      }
    }

    // Update languages
    if (cv_info?.languages) {
      await connection.query("DELETE FROM languages WHERE cv_id = ?", [cv_id]);
      const languagesData = cv_info.languages.map((language) => [
        cv_id,
        language.language,
        language.proficiency,
      ]);
      if (languagesData.length > 0) {
        await connection.query(
          "INSERT INTO languages (cv_id, language, proficiency) VALUES ?",
          [languagesData]
        );
      }
    }

    // Update internships
    if (cv_info?.internships) {
      await connection.query("DELETE FROM internships WHERE cv_id = ?", [
        cv_id,
      ]);
      const internshipsData = cv_info.internships.map((internship) => [
        cv_id,
        internship.jobTitle,
        internship.company,
        internship.city,
        internship.description,
        internship.start_date,
        internship.end_date,
      ]);
      if (internshipsData.length > 0) {
        await connection.query(
          "INSERT INTO internships (cv_id, jobTitle, company, city, description, start_date, end_date) VALUES ?",
          [internshipsData]
        );
      }
    }

    // Update links
    if (cv_info?.links) {
      await connection.query("DELETE FROM links WHERE cv_id = ?", [cv_id]);
      const linksData = cv_info.links.map((link) => [
        cv_id,
        link.label,
        link.url,
      ]);
      if (linksData.length > 0) {
        await connection.query(
          "INSERT INTO links (cv_id, label, url) VALUES ?",
          [linksData]
        );
      }
    }

    res.status(200).json({ message: "CV updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating CV" });
  }
};

// DELETE a CV by unique ID
exports.deleteCV = async (req, res) => {
  const { cv_unique_id } = req.params;

  try {
    const [result] = await connection.query(
      "DELETE FROM cvs_data WHERE cv_unique_id = ? AND auth_user_id = ?",
      [cv_unique_id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "CV not found" });
    }

    res.status(200).json({ message: "CV deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting CV" });
  }
};

exports.getAllPublicCVs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchJobTitle = req.query.jobTitle;

    // Base SQL query
    let baseQuery = `
      SELECT 
        cvs_data.cv_id, 
        cvs_data.cv_unique_id, 
        cvs_data.created_at,
        cvs_data.template_visibility,
        cvs_data.hobbies,
        user_data.firstName, 
        user_data.lastName, 
        user_data.jobTitle,
        user_data.address, 
        user_data.city, 
        user_data.postal_code, 
        user_data.country, 
        user_data.phone, 
        user_data.email, 
        user_data.date_of_birth, 
        user_data.place_of_birth, 
        user_data.nationality, 
        user_data.summary, 
        user_data.template_id
      FROM cvs_data
      INNER JOIN user_data ON cvs_data.cv_id = user_data.cv_id
      WHERE cvs_data.template_visibility = "Public"
    `;

    // Add search condition if jobTitle is provided
    const queryParams = [];
    if (searchJobTitle) {
      baseQuery += ` AND user_data.jobTitle LIKE ?`;
      queryParams.push(`%${searchJobTitle}%`);
    }

    // Add pagination
    baseQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Execute query
    const [cvs] = await connection.query(baseQuery, queryParams);

    if (cvs.length === 0) {
      return res.status(404).json({ message: "No public CVs found" });
    }

    // Fetch relational data for these CVs
    const cvIds = cvs.map((cv) => cv.cv_id);
    // const [employmentHistory] = await connection.query(
    //   `
    //   SELECT cv_id, jobTitle, employer, city, description, start_date, end_date, is_current
    //   FROM employment_history
    //   WHERE cv_id IN (?)
    // `,
    //   [cvIds]
    // );

    // const [education] = await connection.query(
    //   `
    //   SELECT cv_id, degree, school_name, city, start_date, end_date, description
    //   FROM education
    //   WHERE cv_id IN (?)
    // `,
    //   [cvIds]
    // );

    // const [courses] = await connection.query(
    //   `
    //   SELECT cv_id, title, institution, start_date, end_date
    //   FROM courses
    //   WHERE cv_id IN (?)
    // `,
    //   [cvIds]
    // );

    // const [skills] = await connection.query(
    //   `
    //   SELECT cv_id, skill, proficiency
    //   FROM skills
    //   WHERE cv_id IN (?)
    // `,
    //   [cvIds]
    // );

    // const [languages] = await connection.query(
    //   `
    //   SELECT cv_id, language, proficiency
    //   FROM languages
    //   WHERE cv_id IN (?)
    // `,
    //   [cvIds]
    // );

    // const [internships] = await connection.query(
    //   `
    //   SELECT cv_id, jobTitle, company, city, description, start_date, end_date
    //   FROM internships
    //   WHERE cv_id IN (?)
    // `,
    //   [cvIds]
    // );

    // const [links] = await connection.query(
    //   `
    //   SELECT cv_id, label, url
    //   FROM links
    //   WHERE cv_id IN (?)
    // `,
    //   [cvIds]
    // );

    // Map CV data and add relational data
    const cvMap = {};
    cvs.forEach((cv) => {
      cvMap[cv.cv_id] = {
        cv_id: cv.cv_id,
        cv_unique_id: cv.cv_unique_id,
        // created_at: cv.created_at,
        template_visibility: cv.template_visibility,
        // hobbies: cv.hobbies,
        user: {
          firstName: cv.firstName,
          lastName: cv.lastName,
          jobTitle: cv.jobTitle,
          // address: cv.address,
          city: cv.city,
          // postal_code: cv.postal_code,
          country: cv.country,
          phone: cv.phone,
          email: cv.email,
          // date_of_birth: cv.date_of_birth,
          // place_of_birth: cv.place_of_birth,
          nationality: cv.nationality,
          summary: cv.summary,
          template_id: cv.template_id,
        },
        // employment_history: [],
        // education: [],
        // courses: [],
        // skills: [],
        // languages: [],
        // internships: [],
        // links: [],
      };
    });

    // Attach relational data
    // employmentHistory.forEach((job) =>
    //   cvMap[job.cv_id].employment_history.push(job)
    // );
    // education.forEach((edu) => cvMap[edu.cv_id].education.push(edu));
    // courses.forEach((course) => cvMap[course.cv_id].courses.push(course));
    // skills.forEach((skill) => cvMap[skill.cv_id].skills.push(skill));
    // languages.forEach((language) =>
    //   cvMap[language.cv_id].languages.push(language)
    // );
    // internships.forEach((internship) =>
    //   cvMap[internship.cv_id].internships.push(internship)
    // );
    // links.forEach((link) => cvMap[link.cv_id].links.push(link));

    // Convert cvMap to array
    const result = Object.values(cvMap);

    // Send the response
    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      total_records: cvs.length,
      cvs: result,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching public CVs" });
  }
};
