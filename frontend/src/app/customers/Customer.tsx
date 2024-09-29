import CustomerAddEdit from "./AddEdit";

const Customer = () => {

    return (
        <>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Customer</h1>
            </div>
            <div
                className="flex flex-col divide-y divide-slate-500"
            >
                <CustomerAddEdit />
                {/* <div className="w-full border-4 border-slate-500"></div> */}
                
            </div>
        </>
    )

}

export default Customer;