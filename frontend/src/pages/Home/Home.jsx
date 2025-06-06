import React, { useState } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import ChatBot from "../../components/ChatBot/ChatBot.jsx";
import TableReservation from "../../components/TableReservation/TableReservation";

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <>
      <Header />
      <FoodDisplay category="All" title="Recommended for you" />
      <ExploreMenu setCategory={setCategory} category={category} />
      <FoodDisplay category={category} />
      <TableReservation />
      <AppDownload />
      <ChatBot />
    </>
  );
};

export default Home;