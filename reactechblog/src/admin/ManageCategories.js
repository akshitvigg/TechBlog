import {Button, Modal} from 'react-bootstrap';
import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {FaPlus,FaTimes} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import ReactLoading from 'react-loading';


const ManageCategories = () => {
    let {register, handleSubmit, reset, formState: {errors}} = useForm()
    let [categories,setCategries] = useState([])
    const [show, setShow] = useState(false);
    let [status, setStatus] = useState(true);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function handleForm(data) {
        let {category} = data
        axios.post("/add-category",{
            category
        }).then(res=>{
            if(res.data==="inserted"){
                reset();
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Category added successfully',
                    showConfirmButton: false,
                    timer: 1500
                })
                viewCategories()
                handleClose()
            } else {
                Swal.fire({icon: "error", title: res.data === "exists" ? "Category already exists" : "Could not add category"});
            }
        }).catch(() => Swal.fire({icon: "error", title: "Could not add category", text: "Please try again."}))

    }
    let viewCategories = ()=>{
        setStatus(true)
        axios.get("/view-categories").then(res=>{
            setStatus(false)
            setCategries(Array.isArray(res.data) ? res.data : []);
        }).catch(() => {
            setStatus(false)
            Swal.fire({icon: "error", title: "Could not load categories", text: "Check that the server is running."})
        })
    }
    useEffect(() => {
        viewCategories();
    }, [])
    function delCategory(id){

        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete("/del-category/"+id).then(res=>{
                    if(res.data ==="deleted"){
                        viewCategories()
                    } else if (res.data === "in use") {
                        Swal.fire({icon: "warning", title: "Category is in use", text: "Move or remove its questions and blogs before deleting it."})
                    }
                }).catch(error => Swal.fire({
                    icon: "error",
                    title: "Could not delete category",
                    text: error.response?.data || "Please try again."
                }))
            }
        })

    }
    return (
        <>
            <section className="faq p-16">
                <div className="container">
                    <div className="heading">
                        <div className="left">
                            <h3 className="light-black">Manage Categories</h3>
                        </div>
                    </div>
                    <Button variant="primary" className={"mt-3 mb-3"} onClick={handleShow}>
                        <FaPlus/>
                    </Button>
                    {
                        status ?
                            <ReactLoading type={"spinningBubbles"} color={"coral"}></ReactLoading>
                            :
                            categories.length > 0 ?
                                <table className={"table table-hover align-middle"}>
                                    <thead>
                                    <tr className={"text-center table-light"}>
                                        <th>Sr. No.</th>
                                        <th>Category Name</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        categories.map((value,index)=>{
                                            let {cat_id,cat_name} = value
                                            return(
                                                <tr key={index} className={"text-center"}>
                                                    <td>{index+1}</td>
                                                    <td>{cat_name}</td>
                                                    <td>
                                                        <button type={"button"} className={"btn btn-3"} onClick={()=>delCategory(cat_id)}><FaTimes/></button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table> :
                                <div className="tb-empty-state">
                                    <h4>No categories yet</h4>
                                    <p>Add categories so users can organize questions and blogs.</p>
                                    <button className="btn btn-3" type="button" onClick={handleShow}><FaPlus/> Add a category</button>
                                </div>
                    }
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title className={"text-dark"}>Add New Category</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form id={"form"} onSubmit={handleSubmit(handleForm)}>
                                <div className={"row mb-4"}>
                                    <div className={"col-lg-12"}>
                                        <div className="single-form">
                                            <label htmlFor={"category"} className={"text-dark"}>Category</label>
                                            <input type={"text"}  {...register('category',{required:"Category Name is required"})}/>
                                            <ErrorMessage name={"category"} errors={errors}
                                                          render={({message}) => <p
                                                              className={"text-danger"}>{message}</p>}></ErrorMessage>

                                        </div>
                                    </div>
                                    <div className={"col-lg-12 mt-3"}>
                                        <div className="single-form">
                                            <button type={"submit"} className={"btn btn-1"}>Submit</button>
                                        </div>
                                    </div>

                                </div>

                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </section>
        </>
    )
}
export default ManageCategories;