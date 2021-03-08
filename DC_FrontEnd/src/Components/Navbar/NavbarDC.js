import React from 'react';
import { Navbar, Nav, Button, DropdownButton, Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '../../Logo/DCoin1.svg';
import LogoText from '../../Logo/DCoinText.svg';
import './NavbarDC.css';
import { FaSignInAlt, FaUserPlus, FaUser, FaPowerOff } from 'react-icons/fa';
import {  } from 'react-icons/fa';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/app.action';
import {useHistory} from 'react-router-dom'

function NavbarDC(props) {

    const history = useHistory();


    const logout = () => {
        props.actions.storeUserData(false)
        console.log("Logged out");
        history.push("/")
    }
    

    if (props.applicationState.user !== false) {
        return (
            
            <Navbar bg="dark" variant="dark" sticky="top" collapseOnSelect expand="md">
                <div>
                <a href="/" className="navbar-brand">
                    <img
                    src={Logo}
                    width="50"
                    height="50"
                    className="d-inline-block align-top"
                    alt="DCoin Logo"
                    />  
                </a>
                <a href="/" className="navbar-brand">
                <img
                    src={LogoText}
                    height="50"
                    className="d-inline-block align-top"
                    alt="DCoin Text Logo"
                    />
                </a>
                </div>
                
                {/* <DropdownButton  id="dropdown-button-drop-left" drop="left" className="silver-background"  key="left" variant="light" title="User">
                    <Dropdown.Item href="/account">Account</Dropdown.Item>
                    <Dropdown.Item href="/">Dashboard</Dropdown.Item>
                    <Dropdown.Item onClick={logout} style={{color:"red"}}>Logout</Dropdown.Item>
                </DropdownButton> */}

                {/* <OverlayTrigger
                    trigger="click"
                    key="left"
                    placement="left"
                    overlay={
                        <Popover id="popover-positioned-left">
                        <Popover.Title as="h3"></Popover.Title>
                        <Popover.Content>
                            <Button onClick={logout} style={{color:"red"}}>Logout</Button>
                        </Popover.Content>
                        </Popover>
                    }
                    >
                    <Button variant="primary"><FaUser/></Button>
                </OverlayTrigger> */}



                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                
                <Navbar.Collapse id="responsive-navbar-nav">
                    {/* Nav Links */}
                    <Nav>
                        <Nav.Link href="/">Dashboard</Nav.Link>
                        <Nav.Link href="/account">Account</Nav.Link>
                    </Nav>
                    
                </Navbar.Collapse>

                <Button className="logout" variant="outline-danger" onClick={logout} title="Logout"><FaPowerOff/></Button>
            
            </Navbar>
            
        )
    }else{

        //**************if not logged in**************

        return (
            
            <Navbar bg="dark" variant="dark" sticky="top">
                <div>
                <a href="/">
                <img
                    src={Logo}
                    width="50"
                    height="50"
                    className="d-inline-block align-top"
                    alt="DCoin Logo"
                    />  
                </a>
                
                <a href="/">
                <img
                    src={LogoText}
                    height="50"
                    className="d-inline-block align-top"
                    alt="DCoin Text Logo"
                    />
                </a>
                </div>

                {/* <Navbar.Toggle aria-controls="responsive-navbar-nav" /> */}
                    <div className="NavButtons">
                        <a href="/registerKeys">
                            <Button variant="outline-light" className="button-text1">
                                <FaUserPlus/>
                            </Button>
                        </a>

                        <a href="/login">
                            <Button variant="outline-light" className="button-text2">
                                <FaSignInAlt/>
                            </Button>
                        </a>
                    </div>

                
            </Navbar>
            
        )
    }
    
}

const mapStateToProps = state => ({ applicationState: state });
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) });
export default connect(mapStateToProps, mapDispatchToProps)(NavbarDC);