import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Header from "@/components/Header";
import Search from "@/components/Search";
import ParallelCoordinate from "@/components/ParallelCoordinate";
import Compare from "@/components/Compare";
import SearchedItem from "@/components/SearchedItem"
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

function App() {
    const [items, setItems] = useState([]);
    const [addedItem, setAddedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleSongClick = (d) => {
        let newSelectedItems = [];
        if (selectedItems.some((item) => item.id === d.id && item.section === d.section)) {
            newSelectedItems = selectedItems.filter(
                (item) => !(item.id === d.id && item.section === d.section)
            );
        } else {
            newSelectedItems = [...selectedItems, d];
            if (newSelectedItems.length > 2) {
                toast.error("You can only select up to 2 items for comparison.");
                return;
            }
        }

        setSelectedItems(newSelectedItems);
    };

    const deleteItem = (id) => {
        setItems(items.filter(item => item.id !== id))
    }

    return (
        <>
            {/* <Header /> */}
            <div id="app">
                <div className="left-side">
                    <ParallelCoordinate
                        items={items}
                        addedItem={addedItem}
                        setAddedItem={setAddedItem}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        handleSongClick={handleSongClick}
                    />
                    <Compare
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                </div>

                <div className="right-side">
                    <div className="main-title">
                        CodeChord
                    </div>
                    <Search
                        items={items}
                        setItems={setItems}
                        setAddedItem={setAddedItem}
                    />
                    <div className="searched-items-area">
                        {items.map((item, index) => (
                            <SearchedItem
                                key={item.id}
                                index={index}
                                item={item}
                                selectedItems={selectedItems}
                                handleSongClick={handleSongClick}
                                deleteItem={deleteItem}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <ToastContainer
                position="top-left"
                hideProgressBar={true}
                />
        </>
    );
}

export default App;
