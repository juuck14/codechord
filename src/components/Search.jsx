import data from "@/data/datatest.json"
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { useEffect, useState } from 'react'

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
        console.log(string, results)
    }

    const handleOnHover = (result) => {
        // the item hovered
        console.log(result)
    }

    const handleOnSelect = async (item) => {
        // the item selected
        console.log(item)
        if (items.some(i => i.id === item.id)) {
            console.log('Item already exists in the list')
        } else if (items.length >= 10) {
            console.log('Maximum of 10 items reached')
            clearInput()
        } else {
            setItems([...items, item])
            setAddedItem(item)
        }
        clearInput()

        // Clear the input after selection
    }

    const clearInput = () => {
        const input = document.querySelector("#root > div > div:nth-child(2) > div.App > header > div > div > div > input[type=text]")
        input.style.opacity = 0
        setTimeout(() => {
            const clear = document.querySelector("#root > div > div:nth-child(2) > div.App > header > div > div > div > div")
            console.log(clear)
            clear.click()
            input.style.opacity = 1
        }, 10);
    }

    const handleOnFocus = () => {
        console.log('Focused')
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
        <div className="App">
        <header className="App-header">
                <ReactSearchAutocomplete
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
                />
        </header>
        </div>
    )
}