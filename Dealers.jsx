import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import { useNavigate, useParams } from "react-router-dom";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png"

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const { state } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    fetch("/djangoapp/get_dealers").then(response => response.json()).then(result => {
      const dealers = result.dealers || [];
      setStates([...new Set(dealers.map(dealer => dealer.state))].sort());
      setDealersList(state ? dealers.filter(dealer => dealer.state === state) : dealers);
    });
  }, [state]);

let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;
return(
  <div>
      <Header/>

     <table className='table'>
      <tr>
      <th>ID</th>
      <th>Dealer Name</th>
      <th>City</th>
      <th>Address</th>
      <th>Zip</th>
      <th>
      <select name="state" id="state" value={state || "All"} onChange={(e) => navigate(e.target.value === "All" ? "/" : "/dealers/" + encodeURIComponent(e.target.value))}>
      
      <option value="All">All States</option>
      {states.map(state => (
          <option value={state}>{state}</option>
      ))}
      </select>        

      </th>
      {isLoggedIn ? (
          <th>Review Dealer</th>
         ):<></>
      }
      </tr>
     {dealersList.map(dealer => (
        <tr>
          <td>{dealer['id']}</td>
          <td><a href={'/dealer/'+dealer['id']}>{dealer['full_name']}</a></td>
          <td>{dealer['city']}</td>
          <td>{dealer['address']}</td>
          <td>{dealer['zip']}</td>
          <td>{dealer['state']}</td>
          {isLoggedIn ? (
            <td><a href={`/postreview/${dealer['id']}`}><img src={review_icon} className="review_icon" alt="Post Review"/></a></td>
           ):<></>
          }
        </tr>
      ))}
     </table>
  </div>
)
}

export default Dealers
