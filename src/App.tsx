import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState ,useEffect} from 'react';
import { z, ZodType } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from 'react-modal';
import styles from'./app.module.css';
import { collection, addDoc ,getDocs } from "firebase/firestore";
import { db } from './config/myfirebase';

// Defining an enumeration for job types & country codes.
const DropdownOptions = z.enum(['IT', 'Marketing', 'Business Development']);
const CountryCodes = z.enum(['+966', '+965', '+971']);


// Defining a TypeScript type for the form data.
type newForm = {
  dropdown: z.infer<typeof DropdownOptions>;
  countrycodes: z.infer<typeof CountryCodes>;
  phoneNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

// Defining a Zod schema for form validation.
const schema: ZodType<newForm> = z
  .object({
    firstName: z.string().min(2).max(30),
    lastName: z.string().min(2).max(30),
    email: z.string().email(),
    age: z.number().min(18).max(70),
    phoneNumber: z.number(),
    dropdown: DropdownOptions,
    countrycodes: CountryCodes,
    password: z.string().min(5).max(20),
    confirmPassword: z.string().min(5).max(20),
    terms: z.boolean()
    .refine((data) => data === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Defining the main functional component of the application.
const App: React.FC = () => {
// Using useState.
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formValues, setFormValues] = useState<newForm[]>([]);
  const [users,setUsers]  = useState<any>(false);
  
// Using useForm to handle form submission and validation.
  const {register,handleSubmit,formState: { errors },} = useForm<newForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:'',
      lastName:'',
      email: '',
      terms: false,
  },
  });

// Using useEffect to fetch data from Firebase when the component mounts.
  useEffect(() => {
    const fetchData = async () => {
      
        const docRef = await getDocs(collection(db, "forms"));
        const usersData = docRef.docs.map(doc => doc.data());
        setUsers(usersData);
        console.log(users)
    };
    fetchData();
  }, []);

  
// Defining an async function to handle form submission.
  const submitData: SubmitHandler<newForm> = async (data) => {
    try {
      if (!data.phoneNumber) {
        toast.error('Phone Number is required');
        return;
      }
      console.log("it worked",data);
      toast.success('Form submitted successfully!');
      setFormValues((prevData) => [...prevData, data]);
  
      const docRef = await addDoc(collection(db, "forms"), data);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
      toast.error("Error adding document")
    }
  }
  
// Returning the JSX to render the form, table, and modal.
  return (  
    <div className="App">
      <form onSubmit={handleSubmit(submitData)}>
        <label> First Name: </label>
        <input type="text" {...register("firstName")} />
        <br />
        {errors.firstName && <span> {errors.firstName.message}</span>}
        <label> Last Name: </label>
        <input type="text" {...register("lastName")} />
        <br />
        {errors.lastName && <span> {errors.lastName.message}</span>}

        <label> Email: </label>
        <input type="email" {...register("email")} />
        <br />
        {errors.email && <span> {errors.email.message}</span>}

        <label> Age </label>
        <input type="number" {...register('age', { valueAsNumber: true })} />
        <br />
        {errors.age && <span> {errors.age.message}</span>}

        <label htmlFor="dropdown">Job Type</label>
        <select {...register("dropdown")} >

          <option value="IT">IT</option>
          <option value="Marketing">Marketing</option>
          <option value="Business Development">Business Development</option>
        </select>
        {errors.dropdown && <span>{errors.dropdown.message}</span>}

        <label>Phone Number:</label>
        <div><select  style={{ width: '70px' }}{...register("countrycodes")}>
          <option></option>
          <option value="+966">+966</option>
          <option value="+965">+965</option>
          <option value="+971">+971</option>
        </select>

        <input  type="text" style={{ width: '190px' }}  {...register('phoneNumber', { valueAsNumber: true })} />
        </div><br />
        {errors.phoneNumber && <span>{errors.phoneNumber.message}</span>}

        <label> Password: </label>
        <input type="password" {...register("password")} />
        <br />
        {errors.password && <span> {errors.password.message}</span>}
        <label> Confirm Password: </label>
        <input type="password" {...register("confirmPassword")} />
        <br />
        {errors.confirmPassword && <span> {errors.confirmPassword.message}</span>}
        <br />
        <label>
          <input
            id="terms"
            aria-describedby="terms"
            style={{ width: '15px' }} 
            type="checkbox" {...register("terms")}
          />
          I agree to the terms and conditions
        </label>
        {errors.terms && <span>{errors.terms.message}</span>}
        <br />
        <br />
        <button className={styles.mybutton} type="button" onClick={() => setModalIsOpen(true)}>
          View terms
        </button>
        <button type="submit" className={styles.mybutton}>Submit</button>
        <br />

      </form>

      <table className={styles.styledTable}>
        <thead>
          <tr>
            <th>First name</th>
            <th>Last name</th>
            <th>Job type</th>
            <th>Email</th>
            <th>Age</th>
            <th>phone number</th>
            <th>Password</th>
            <th>Terms</th>
          </tr>
        </thead>
        <tbody>
        {users && users.map((userData: any, index: any) => (
            <tr key={index} className={styles.activerow}>
              <td>{userData.firstName}</td>
              <td>{userData.lastName}</td>
              <td>{userData.dropdown}</td>
              <td>{userData.email}</td>
              <td>{userData.age}</td>
              <td>{userData.countrycodes}{userData.phoneNumber}</td>
              <td>{userData.password}</td>
              <td>{userData.terms ? 'Accepted' : 'Not accepted'}</td>
            </tr>
          ))}
          {formValues.map((formData, index) => (
            <tr key={index}>
              <td>{formData.firstName}</td>
              <td>{formData.lastName}</td>
              <td>{formData.dropdown}</td>
              <td>{formData.email}</td>
              <td>{formData.age}</td>
              <td>{formData.countrycodes}{formData.phoneNumber}</td>
              <td>{formData.password}</td>
              <td>{formData.terms ? 'Accepted' : 'Not accepted'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='App' >{(users.length == 0 && formValues.length == 0) && <h1>There is no form in the database</h1>}</div>
      <ToastContainer />

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>Terms and Conditions</h2>
        <p>
        - Develop a basic form using React JS, comprising the following input fields:<br />
        <br />
        • Full name Phone number (inclusive of country code selection)<br />
        • Email Address<br />
        • Password<br />
        • Job Type Dropdown (featuring the options: IT, Marketing, Business Development)<br />
        <br /><br />
        - Terms and conditions agreement (to be accepted via Radio Buttons), with an option for the user to view these terms in a modal by clicking on the text.
        <br /><br />
        - Error messages should be displayed via Toast notifications in the event of data submission errors. Similarly, successful data submissions should trigger success Toast notifications.
        <br /><br />
        - add to that code terms and conditions agreement (to be accepted via Radio Buttons), with an option for the user to view these terms in a Modal by clicking on the text. using react and typescript
        <br /><br />
        - Following data submission, save the data in Firebase. This submitted data should be displayed in a section beneath the form, not just on a page refresh, but in real-time, ensuring that any changes or additions to the data are reflected instantly. Upon reloading the page, if data exists in the database, it should be automatically retrieved and displayed in the data section under the form in real-time. In the case that no data is available, display a straightforward message or an illustrative image to indicate the absence of data in the database


        </p>
        <button className={styles.mybutton} onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

// Exporting the App component as the default export.
 export default App;
