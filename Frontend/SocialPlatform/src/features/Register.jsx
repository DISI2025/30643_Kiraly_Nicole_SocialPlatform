import React from 'react';
import {
    TextField,
    Button,
    Typography,
    Grid,
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { registerUser, getUserData  } from '../assets/api.jsx'; // Import the registerUser API function

const validationSchema = yup.object({
    firstName: yup.string().min(2, 'Must be at least 2 characters').required('First name is required'),
    lastName: yup.string().min(2, 'Must be at least 2 characters').required('Last name is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    role: yup.string().required('Role is required'),
    image: yup.string().url('Invalid URL').nullable(),
});

const Register = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'USER',
            image: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setErrors }) => {
            try {
                const response = await registerUser(values); // Register the user
                const {jwt} = response; // Get the JWT token
                localStorage.setItem('token', jwt); // Store the JWT token in localStorage

                // Fetch user data using the JWT
                const userResponse = await getUserData(jwt); // Fetch the user data with the JWT token
                const user = userResponse.data; // Assume the user data is returned here
                localStorage.setItem('user', JSON.stringify(user)); // Store user data in localStorage

                navigate('/login'); // Navigate to login after successful registration
            } catch (err) {
                setErrors({submit: err.message}); // Show error if registration fails
            }
        }
    });

    return (
        <Grid
            container
            component="main"
            sx={{
                height: "100vh",
                width: "100vw",
                overflow: "hidden"
            }}
        >
            {/* Left Side - Form */}
            <Grid
                item
                xs={12} md={6}
                component={Paper}
                elevation={6}
                square
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 4,
                    height: "100%"
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    <span style={{ display: "flex", alignItems: "center" }}>
                        <strong style={{
                            marginRight: 8,
                            background: "black",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "50%"
                        }}>R</strong>
                        Register
                    </span>
                </Typography>

                {formik.errors.submit && (
                    <Typography color="error" align="center" sx={{ marginBottom: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                        {formik.errors.submit}
                    </Typography>
                )}

                <Box component="form" sx={{ mt: 1, width: "70%", display: "flex", flexDirection: "column", alignItems: "center" }} onSubmit={formik.handleSubmit}>
                    <TextField
                        label="First Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps('firstName')}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                    <TextField
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps('lastName')}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps('email')}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps('password')}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <TextField
                        label="Image URL"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        {...formik.getFieldProps('image')}
                        error={formik.touched.image && Boolean(formik.errors.image)}
                        helperText={formik.touched.image && formik.errors.image}
                    />
                    <FormControl fullWidth margin="normal" error={formik.touched.role && Boolean(formik.errors.role)}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            {...formik.getFieldProps('role')}
                        >
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: "#0c2734", width: "20%" }}
                    >
                        Register
                    </Button>
                </Box>

                <Grid container justifyContent="center" mt={2}>
                    <Grid item>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#0c2734', fontWeight: 'bold' }}>
                            Already have an account? Login
                        </Link>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center" mt={2}>
                    <Grid item>
                        <Button
                            onClick={() => navigate('/')}
                            sx={{ color: "#0c2734", fontWeight: 'bold' }}
                        >
                            Back to Home
                        </Button>
                    </Grid>
                </Grid>
            </Grid>

            {/* Right Side - Image */}
            <Grid
                item
                xs={false} md={6}
                sx={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1516387938699-a93567ec168e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwaGFuZHN8ZW58MHx8MHx8fDA%3D')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "100%",
                }}
            />
        </Grid>
    );
};

export default Register;
