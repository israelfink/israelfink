import React, { Component, useState } from "react";
import {
    Col, Button, Form, FormGroup, Label, Input, Collapse
} from 'reactstrap';
import { GetJson, SetErrorState, GetCandidateTypes, Controllers, CandidateObj, PersonObj } from "./GeneralService";
import { Person } from "./Person";
import { PersonDropDwon, StatusTypeDropDown } from "./DropDwons";
import ExtendedDetails from "./ExtendedDetails";

export default class Candidate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            persons: [{ id: 0, personName: 'Loading...' }],
            candidate: '',
            isFormValid: false,
            errors: {},
            gender: 0,
            communities: [{ id: 0, name: 'Loading' }],
            loading: true,
            newPerson: false,
            candidateTypes: [{ id: 0, personName: 'Loading...' }],
        }
    }
    async getCandidate() {
        let url = window.location.href;
        let splited = url.split('/');
        let id = splited[splited.length - 1];
        let candidate = null;
        let gender = 0;
        if (!isNaN(id)) {
            const response = await fetch('api/candidates/' + id);
            const data = await response.json();
            candidate = data;
            //gender = data.gender;
        }
        else
            candidate = Object.create(CandidateObj);
        this.setState({
            candidate: candidate,
            gender: gender,
            loading: false,
            candidateTypes: GetCandidateTypes(gender),
        });
        this.props.setBody(candidate);
        console.log(candidate);
        console.log(this.state);
        console.log(this.state.candidate);
    }
    async populatePersons() {
        const persons = await GetJson(Controllers.PersonNames);
        this.setState({ persons })
    }
    async populateCommunites() {
        let communities = await GetJson(Controllers.Communities);
        this.setState({ communities });
    }
    componentDidMount() {
        this.getCandidate();
        this.populatePersons();
        this.populateCommunites();
    }
    changeHandler = e => {
        let name = e.target.name;
        let value = e.target.value;
        let error = '';
        switch (name) {
            case '':
                break;
            default:
                break;
        }
        this.setCandidateState(name, value);
        SetErrorState(name, error, this);
        console.log(name, value);
        console.log(this.state);
    }
    setCandidateState(name, value) {
        let candidate = this.state.candidate;
        candidate[name] = value;
        this.setState({ candidate }, this.formValid);
     //   this.props.setBody(this.state.candidate);
    }
    formValid = (valid = true) => {
        let formValid = valid && Object.keys(this.state.errors).length === 0;
        this.props.formValid(formValid);
    }
    isCandidateEmpty() {
        return Object.keys(this.state.candidate).length === 0;
    }
    getPersonID = pid => {
        this.setCandidateState('personID', Number(pid));
    }
    setEDetailsBody = (eDetails) => {
        this.setState(state => (state.candidate.extendedDetails = eDetails, state));
        this.setState(state=> (state.candidate.extendedDetails.prevMarrigeDetails = eDetails.prevMarrigeDetails, state));
        this.props.setBody(this.state.candidate);
    }
    setPersonBody = (person) => {
        this.setState(state => (state.candidate.person = person, state));
        this.setState(state => (state.candidate.person.phones = person.phones));
        this.props.setBody(this.state.candidate);
    }
    togglePerson() {
        this.setState(prevState => ({ newPerson: !prevState.newPerson }));
    }
    getPerson() {
        if (this.state.loading || !this.state.newPerson)
            return '';
        return (
            this.state.candidate && !this.isCandidateEmpty() ?
                <Person person={this.state.candidate.person} formValid={this.formValid} setBody={this.setPersonBody} />
                : <Person person={Object.create(PersonObj)} formValid={this.formValid} setBody={this.setPersonBody} />
        );
    }

    render() {
        return (
            <div style={{ textAlign: 'right' }}>
                <h1 style={{ textAlign: "center" }}>פרטי מועמד</h1>
                {/*                <StatusTypeDropDown />
 */}
                <Form onSubmit={this.submitForm} style={{ textAlign: 'right' }}>
                    <FormGroup row>
                        <Label sm={2} for='person'>Person</Label>
                        {<PersonDropDwon retData={this.getPersonID} presons={this.state.persons ?? ''}
                            selected={this.state.candidate.personID ?? '0'} />}
                    </FormGroup>
                    <button className='btn btn-secondary'
                        onClick={(e) => {
                            e.preventDefault();
                            this.setState(prevState => ({ newPerson: !prevState.newPerson }));
                        }}>הוסף איש חדש</button>
                    <Collapse isOpen={this.state.newPerson}>
                        {this.getPerson()}
                    </Collapse>
                    <h4>פרטי מועמד</h4>
                    <FormGroup row>
                        <Label sm={2}>מזהה מועמד:</Label>
                        <Label sm={2} >{this.state.candidate.id}</Label>
                    </FormGroup>
                    <FormGroup row>
                        <Label sm={2} for='candidateType'>סוג מועמד</Label>
                        <select name='candidateType' value={this.state.candidate.candidateType ?? '-1'} onChange={this.changeHandler}>
                            <option value='-1' key='-1'>בחר...</option>
                            {this.state.candidateTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>

                        <Label sm={2} for='community'>קהילה</Label>
                        <select sm={3} id='communityID' name='communityID' value={this.state.candidate.communityID ?? '0'} onChange={this.changeHandler}>
                            <option key='0' value='0'>בחר...</option>
                            {this.state.communities.map(community => (
                                <option key={community.id} value={community.id}>
                                    {community.name}
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                    <FormGroup row>
                        <Label sm={2} for='communityFreeText'>קהילה - הערות</Label>
                        <Col sm={10}>
                            <Input id='communityFreeText' name='communityFreeText' value={this.state.candidate.communityFreeText ?? ''} onChange={this.changeHandler} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label sm={2} for='comments'>הערות</Label>
                        <Col sm={10}>
                            <textarea style={{ width: '100%' }} id='comments' name='comments' value={this.state.candidate.comments ?? ''} onChange={this.changeHandler} />
                        </Col>
                    </FormGroup>
                    {
                    this.state.candidate && this.state.candidate.extendedDetails && !this.isCandidateEmpty() ?
                        <ExtendedDetails extendedDetails={this.state.candidate.extendedDetails}
                        formValid={this.formValid} setBody={this.setEDetailsBody} /> : ''
                }
                </Form>
            </div>);
    }
}