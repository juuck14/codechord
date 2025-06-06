import data from "@/data/datatest.json"
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function Search({ items, setItems, addedItem, setAddedItem }) {
    useEffect(() => {
        data.forEach((item , index) => {
            item.id = index
        })
        setItems([...items, ...data.slice(0, 5)]) // Initialize with first 10 items
    }, [])

    const handleOnSearch = (string, results) => {
        // onSearch will have as the first callback parameter
        // the string searched and for the second the results.
        // console.log(string, results)
    }

    const handleOnHover = (result) => {
        // the item hovered
        // console.log(result)
    }

    const handleOnSelect = async (item) => {
        // the item selected
        if (items.some(i => i.id === item.id)) {
            toast.error('Item already exists in the list')
        } else if (items.length >= 10) {
            toast.error('Maximum of 10 items reached')
        } else {
            setItems([...items, item])
            setAddedItem(item)
        }
        clearInput()

        // Clear the input after selection
    }

    const clearInput = () => {
        const input = document.querySelector(".search-bar input")
        input.style.opacity = 0
        setTimeout(() => {
            const clear = document.querySelector(".search-bar .clear-icon")
            console.log(clear)
            clear.click()
            input.style.opacity = 1
        }, 10);
    }

    const handleOnFocus = () => {
        // console.log('Focused')
    }

    const formatResult = (item) => {
        return (
        <>
            <span style={{ display: 'block', textAlign: 'left' }}>Artist: {item.artist}</span>
            <span style={{ display: 'block', textAlign: 'left' }}>Song: {item.song}</span>
        </>
        )
    }

    return (
        <ReactSearchAutocomplete
            className="search-bar"
            items={data}
            fuseOptions={{ keys: ["song", "artist"] }}
            resultStringKeyName="song"
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            showClear
            autoFocus
            formatResult={formatResult}
            placeholder="Search here..."
            styling={{
                width: "394px",
                height: "60px",
                boxShadow: "none",
                border: "none",
                backgroundColor: "var(--background-color)",
                borderRadius: "16px",
                searchIconMargin: '0 0 0 24px',
                fontFamily: "var(--main-font)",
            }}
        />
    )
}