import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Card, CardHeader, CardBody, Row, Col, Button } from "reactstrap";
import { MDBDataTable, MDBTableFoot } from "mdbreact";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdbreact";
import { Link ,useParams} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Pagination } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import swal from "sweetalert";
import csv from "csv-parse";
import Papa from "papaparse";

import {
  ViewContractDbAction,
  CsvViewContractDbAction,
  Invoicelistrequest,
  InvoicelistrequestCSV,
  // InvoicelistrequestEXCEL,
  ClientaRRsearchtrquest,
  Arrlist,
  Datelist,
  GetContractDbFilterListAction,
  getCutomerTotalAction,
  getCutomerTotalFilterAction,
  CsvShowClientAction,
  Clientsearchtrquest,
  pendingrenewal,
} from "../../redux/actions/Admin-saasot-action";
import { cachecleaner } from "../../redux/actions/auth-actions";

import moment from "moment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useNavigate } from "react-router-dom";
import CanvasJSReact from "@canvasjs/react-charts";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { writeFile } from "xlsx";
import { saveAs } from "file-saver";
import { DialogActions, Dialog } from "@mui/material";
import SpinnerLoading from "../../containers/SpinnerLoader";
import LoadingSpinner from "../../containers/LoadingSpinner";
import { parseString } from "xml-js";
import { BACKEND_API_URL } from "../../environment";

import $ from "jquery"; // Import jQuery library

const CustomerByMonth = () => {
  const CanvasJS = CanvasJSReact.CanvasJS;
  const CanvasJSChart = CanvasJSReact.CanvasJSChart;
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const {company_id} =useParams();

  const { pendingrenewalrecord } = useSelector(
    (state) => state.pendingrenewalreducer
  );
  const [usersForRender, setUsersForRender] = useState([]);
  const [excel1, setexcel1] = useState("");
  const [excel2, setexcel2] = useState("");
  const [csv1, setcsv1] = useState("");
  const [csv2, setcsv2] = useState("");
  const [usersForRender2, setUsersForRender2] = useState([]);
  const [usersForRender4, setUsersForRender4] = useState([]);
  const [usersForRender5, setUsersForRender5] = useState([]);
  const [atoZfilter, setAtoZFilter] = useState("customer_name");

  const [usersForRender6, setUsersForRender6] = useState([]);
  const [revinueList, setRevinueList] = useState("billing");
  const [scrollClass, setScrollClass] = useState("");
  const [startPeriod, setStartPeriod] = useState("Jun 16");
  const [endPeriod, setEndPeriod] = useState("Nov 29");
  const containerRef = useRef(null);
  const seccontainerRef = useRef(null);
  const [pageNumShow, setPageNumShow] = useState(1);
  const [pageNumShow1, setPageNumShow1] = useState(1);
  const [viewContractSave, setViewContractSave] = useState([]);
  const [viewContractHeading, setViewContractHeading] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);
  const [secTableLoader, setSecTableLoader] = useState(false);
  const [pageSize, setPageSize] = useState();
  const [invoicelistHeading, setInvoicelistHeading] = useState([]);
  const [addSection, setAddSection] = useState("");
  const tableRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchdb, setsearchdb] = useState("");
  const [currentPage1, setCurrentPage1] = useState(1);
  const [invoicelistPage, setInvoicelistPage] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const handleStartPeriodChange = (event) => {
    setStartPeriod(event.target.value);
  };

  const handleEndPeriodChange = (event) => {
    setEndPeriod(event.target.value);
  };

  const { userData: userDataToken } = useSelector((state) => state.authReducer);

  const { Invoicelist, success: InvoicelistSuccess } = useSelector(
    (state) => state.InvoicegetReducer
  );
console.log("Invoicelist",Invoicelist)
  const { getCotTatal } = useSelector((state) => state.getCutomerTotalReducer);

  const { getCotTatalFilter } = useSelector(
    (state) => state.getCutomerTotalFilterReducer
  );

  const { InvoicelistCsv, error: InvoicelistCsvError } = useSelector(
    (state) => state.CsvInvoicegetReducer
  );


  const { CsvViewContractDbData } = useSelector(
    (state) => state.CsvViewContractDbReducer
  );

  function formatCustomerName(name) {
    return name.replace(/_/g, " ");
  }

  function formatUTCDateToLocaleString(utcDateString) {
    if (!utcDateString) {
      return ""; // Return blank string if utcDateString is null or undefined
    }

    const date = new Date(utcDateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Adding 1 because getUTCMonth() returns zero-based month index
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${month}/${day}/${year}`;
  }

  // const { InvoicelistExcel,error:InvoicelistExcelError } = useSelector((state) => state.ExcelInvoicegetReducer);

  const download_csv = async function () {
    setcsv2(true);
    localStorage.setItem("csv2", "true");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}invoice/download-csv-arr/csv/${selectedOption}/${startPeriod}/${endPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${userDataToken?.token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json(); // Parse the response body as JSON
        if (data?.file_name) {
          const checkFileAvailability = async () => {
            try {
              const response1 = await fetch(
                `${BACKEND_API_URL}invoice/download-file/${data.file_name}/`,
                {
                  headers: {
                    Authorization: `Bearer ${userDataToken?.token}`,
                  },
                }
              );

              if (response1.status === 200) {
                const blob = await response1.blob();
                saveAs(blob, "example.csv");
                setcsv2(false);
                clearInterval(interval); // Stop the interval
              } else if (response1.status === 202) {
                // File is still processing
              } else {
                // Handle other errors
                console.error(
                  "Error downloading CSV file:",
                  response1.statusText
                );
              }
            } catch (error) {
              setcsv2(false);

              console.error("Error downloading CSV file:", error);
            }
          };

          const interval = setInterval(checkFileAvailability, 5000);
        } else {
          setcsv2(false);

          swal("Error downloading CSV file:");
        }
      } else {
        setcsv2(false);

        swal("Error downloading CSV file:");
      }
    } catch (error) {
      setcsv2(false);

      console.error("Error downloading CSV file:", error);
    }
  };
  const handleDownloadCsvFile = async function () {
    setcsv1(true);
    localStorage.setItem("csv1", "true");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}invoice/download-csv-database-table/csv/${revinueList}/${selectedOption}/${startPeriod}/${endPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${userDataToken?.token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json(); // Parse the response body as JSON
        if (data?.file_name) {
          const checkFileAvailability = async () => {
            try {
              const response1 = await fetch(
                `${BACKEND_API_URL}invoice/download-file/${data.file_name}/`,
                {
                  headers: {
                    Authorization: `Bearer ${userDataToken?.token}`,
                  },
                }
              );

              if (response1.status === 200) {
                const blob = await response1.blob();
                saveAs(blob, "example.csv");
                setcsv1(false);

                clearInterval(interval); // Stop the interval
              } else if (response1.status === 202) {
                // File is still processing
              } else {
                // Handle other errors
                console.error("Error downloading CSV file:");
              }
            } catch (error) {
              setcsv1(false);
              console.error("Error downloading CSV file:", error);
            }
          };

          const interval = setInterval(checkFileAvailability, 5000);
        } else {
          setcsv1(false);
          swal("Error downloading CSV file:");
        }
      } else {
        setcsv1(false);

        swal("Error downloading CSV file:");
      }
    } catch (error) {
      setcsv1(false);
      console.error("Error downloading CSV file:", error);
    }
  };

  // useEffect(() => {
  //   let excel = localStorage.getItem("excel1")
  //   let excel1 = localStorage.getItem("excel2")
  //   // let csv = localStorage.getItem("csv2")
  //   // let csv12 = localStorage.getItem("csv1")
  //   setexcel1(excel)
  //   setexcel2(excel1)
  //   // setcsv1(csv12)
  //   // setcsv2(csv)
  // }, []);

  const download_excel = async () => {
    setexcel2(true);
    localStorage.setItem("excel2", "true");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}invoice/download-csv-arr/excel/${selectedOption}/${startPeriod}/${endPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${userDataToken?.token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json(); // Parse the response body as JSON
        if (data?.file_name) {
          const checkFileAvailability = async () => {
            try {
              const response1 = await fetch(
                `${BACKEND_API_URL}invoice/download-file/${data.file_name}/`,
                {
                  headers: {
                    Authorization: `Bearer ${userDataToken?.token}`,
                  },
                }
              );

              if (response1.status === 200) {
                const blob = await response1.blob();
                saveAs(blob, "example.xlsx");
                setexcel2(false);

                clearInterval(interval); // Stop the interval
              } else if (response1.status === 202) {
                // File is still processing
              } else {
                // Handle other errors
                console.error(
                  "Error downloading Excel file:",
                  response1.statusText
                );
              }
            } catch (error) {
              setexcel2(false);
              console.error("Error downloading Excel file:", error);
            }
          };

          const interval = setInterval(checkFileAvailability, 5000);
        } else {
          setexcel2(false);
          swal("Error downloading Excel file:");
        }
      } else {
        setexcel2(false);
        swal("Error downloading Excel file:");
      }
    } catch (error) {
      setexcel2(false);

      console.error("Error downloading Excel file:", error);
    }
  };

  const handleDownloadExcelFile = async () => {
    setexcel1(true);
    localStorage.setItem("excel1", "true");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}invoice/download-csv-database-table/excel/${revinueList}/${selectedOption}/${startPeriod}/${endPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${userDataToken?.token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.json(); // Parse the response body as JSON
        if (data?.file_name) {
          const checkFileAvailability = async () => {
            try {
              const response1 = await fetch(
                `${BACKEND_API_URL}invoice/download-file/${data.file_name}/`,
                {
                  headers: {
                    Authorization: `Bearer ${userDataToken?.token}`,
                  },
                }
              );

              if (response1.status === 200) {
                const blob = await response1.blob();
                saveAs(blob, "example.xlsx");
                setexcel1(false);

                clearInterval(interval); // Stop the interval
              } else if (response1.status === 202) {
                // File is still processing
              } else {
                // Handle other errors
                console.error(
                  "Error downloading Excel file:",
                  response1.statusText
                );
              }
            } catch (error) {
              setexcel1(false);

              console.error("Error downloading Excel file:", error);
            }
          };

          const interval = setInterval(checkFileAvailability, 5000);
        } else {
          setexcel1(false);

          swal("Error downloading Excel file:");
        }
      } else {
        setexcel1(false);

        swal("Error downloading Excel file:");
      }
    } catch (error) {
      setexcel1(false);

      console.error("Error downloading Excel file:", error);
    }
  };

  const {
    ViewContractDbData,
    success: ViewContractDbDataSuccess,
    error,
  } = useSelector((state) => state.ViewContractDbReducer);

  const {
    CsvShowData,
    success: CsvShowDataSuccess,
    error: CsvShowDataError,
  } = useSelector((state) => state.CsvShowClientReducer);

  const { DBfilterData } = useSelector(
    (state) => state.GetContractDbFilterListReducer
  );

  const { Daterecord } = useSelector((state) => state.DatefilterReducer);

  const {
    Arrlistdata,
    success: successArrList,
    error: ArrListError,
  } = useSelector((state) => state.ArrlistReducer);


  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  useEffect(() => {
    if (successArrList) {
      setIsLoading(false);
    }
  }, [successArrList, ArrListError]);

  useEffect(() => {
    if (CsvShowDataSuccess && CsvShowData?.length < 1) {
      swal({
        title: "Data Not Found",
        text: "Please add Transaction or upload excel file.",
        className: "errorAlert-login",
        // icon: "/logoicon_new.png",
        buttons: false,
        timer: 5000,
      });
    }
  }, [CsvShowDataSuccess]);

  const [selectedOption, setSelectedOption] = useState("");

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
    localStorage.setItem("selectedoption", e.target.value);
  };

  useEffect(() => {
    if (selectedOption && startPeriod && endPeriod) {
      dispatch(pendingrenewal(startPeriod, endPeriod, selectedOption));
    }
  }, [selectedOption]);

  useEffect(() => {
    setSelectedOption("day");
    localStorage.setItem("selectedoption", "day");
  }, []);


  useEffect(() => {
    if (
      ViewContractDbDataSuccess &&
      ViewContractDbData &&
      ViewContractDbData.data &&
      ViewContractDbData.heading
    ) {
      setViewContractSave((prevState) => [
        ...prevState,
        ...ViewContractDbData.data,
      ]);
      setViewContractHeading(ViewContractDbData.heading);
      setPageSize(ViewContractDbData?.page_size);
      setTableLoader(false);
    }
  }, [ViewContractDbDataSuccess]);

  useEffect(() => {
    dispatch(Datelist());
    dispatch(GetContractDbFilterListAction());
  }, []);
  useEffect(() => {
    if (revinueList && selectedOption && startPeriod && endPeriod) {
      dispatch(
        ViewContractDbAction(
          revinueList,
          startPeriod,
          endPeriod,
          selectedOption,
          pageNumShow
        )
      );
    }
  }, [revinueList, selectedOption, pageNumShow]);

  useEffect(() => {
    if (revinueList && selectedOption && startPeriod && endPeriod) {
      dispatch(
        ViewContractDbAction(
          revinueList,
          startPeriod,
          endPeriod,
          selectedOption,
          pageNumShow
        )
      );
      setViewContractSave([]);
      setViewContractHeading();
      setPageSize();
    }
  }, [revinueList, selectedOption]);

  useEffect(() => {
    if (selectedOption) {
      dispatch(getCutomerTotalAction(selectedOption));
    }
  }, [selectedOption]);

  useEffect(() => {
    if (selectedOption && revinueList) {
      dispatch(getCutomerTotalFilterAction(selectedOption, revinueList));
    }
  }, [selectedOption, revinueList]);

  // --------------------------------------------CSV Download-----------------------------------------
  // useEffect(() => {
  //   if (revinueList && selectedOption) {
  //     dispatch(
  //       CsvViewContractDbAction(
  //         revinueList,
  //         startPeriod,
  //         endPeriod,
  //         selectedOption
  //       )
  //     );
  //   }
  // }, [revinueList, selectedOption]);

  // useEffect(() => {
  //   if (revinueList) {
  //     dispatch(
  //       CsvViewContractDbAction(
  //         revinueList,
  //         startPeriod,
  //         endPeriod,
  //         selectedOption
  //       )
  //     );
  //   }
  // }, [revinueList, selectedOption]);

  useEffect(() => {
    if (selectedOption && startPeriod && endPeriod) {
      dispatch(Arrlist(startPeriod, endPeriod, selectedOption));
    }
  }, [selectedOption]);

  useEffect(() => {
    if (selectedOption && startPeriod && endPeriod) {
      dispatch(
        Invoicelistrequest(
          startPeriod,
          endPeriod,
          selectedOption,
          pageNumShow1,
          atoZfilter,
          company_id
        )
      );
    }
  }, [
    selectedOption,
    pageNumShow1,
    atoZfilter,
  ]);

  // -----------------------------------CSV donwload--------------------------------------------------------
  // useEffect(() => {
  //   if (selectedOption) {
  //     dispatch(InvoicelistrequestCSV(selectedOption));
  //   }
  // }, [selectedOption]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrollClass("scrolled");
      } else {
        setScrollClass("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollTable = () => {
    const container = containerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const threshold = 15; // Adjust this value as needed
      if (!Clientsearchrecord?.data) {
        if (
          scrollTop + clientHeight >= scrollHeight - threshold &&
          pageNumShow < pageSize
        ) {
          setTableLoader(true);
          setPageNumShow((prevCount) => prevCount + 1);
        }
      }
    }
  };

  const sechandleScroll = () => {
    setAddSection("addfixedDiv");
    const container = seccontainerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const threshold = 150; // Adjust this value as needed
      if (!Clientarrsearchrecord?.data) {
        if (
          scrollTop + clientHeight >= scrollHeight - threshold &&
          pageNumShow1 < invoicelistPage
        ) {
          // alert(pageNumShow1);
          setSecTableLoader(true);
          setPageNumShow1((prevCount) => prevCount + 1);
          // containerRef.current.scrollTop = 2
        }
      }
    }
  };

  // --------------------------------------------butta-------------------------------------------------------
  useEffect(() => {
    if (
      CsvViewContractDbData &&
      CsvViewContractDbData.data &&
      CsvViewContractDbData.heading
    ) {
      const keysToMatch = ["revenue", "billing", "deffered_revenue"];

      const filterArray = (item) => {
        const matchedKey = keysToMatch.find((key) => item[key]);
        return matchedKey ? matchedKey : null;
      };

      const userData = CsvViewContractDbData?.data?.map((item, index) => {
        const selectedArray = filterArray(item);
        const formattedData = {
          product_name: (
            <div className="viewcontractdiv1t" style={{ display: "flex" }}>
              <div style={{ display: "flex" }}>
                <Button title="delete" className="deletebutt">
                  <p
                    className="editiconDelete"
                    onClick={() =>
                      handleCustomerClick1(
                        index,
                        item?.items?.tansaction?.customer_name
                      )
                    }
                  >
                    {formatCustomerName(item?.items?.tansaction?.customer_name)}
                  </p>
                </Button>
              </div>
            </div>
          ),
          order_close_data: item.items?.tansaction?.order_close_data,
          customer_name: item.items?.tansaction?.customer_name,
          invoice_number: item.items?.tansaction?.invoice_number,
          billing_method: item?.items?.productp_service?.product_name,
          qty: item.items?.quantity,
          sale_price: item.items?.sale_price,
          amount: item.items?.amount,
          s_start_d: formatUTCDateToLocaleString(item.items?.s_start_d),
          s_end_d: formatUTCDateToLocaleString(item.items?.s_end_d),
        };
        if (selectedArray !== null) {
          CsvViewContractDbData.heading.forEach((heading) => {
            const columnName = heading.toLowerCase().replace(/[^a-z0-9]/g, "_");
            const revenue = item[selectedArray]?.find(
              (rev) =>
                rev.date.toLowerCase().replace(/[^a-z0-9]/g, "_") === columnName
            );
            formattedData[columnName] = revenue ? revenue.value.toFixed(2) : "";
          });
        }
        return formattedData;
      });

      setUsersForRender5(userData);
    }
  }, [CsvViewContractDbData]);

  const getHeaderValue = (column) => {
    return (column.label ?? "").replace(/<[^>]+>/g, ""); // Use nullish coalescing operator to handle undefined label
  };

  useEffect(() => {
    if (Invoicelist?.data) {
      setFilteredData((prevState) => [...prevState, ...Invoicelist?.data]);
      setInvoicelistHeading(Invoicelist?.heading);
      setInvoicelistPage(Invoicelist?.page_size);
      setSecTableLoader(false);
    }
  }, [Invoicelist, InvoicelistSuccess]);

  const handleCustomerClick = (index, customer_name) => {
    const customer = filteredData?.find(
      (item) => item.customer_name === customer_name
    ); // Find the customer object based on the customer_name
    const idxArray = customer?.ids; // Get the idx array from the customer object

    if (idxArray) {
      const idsString = idxArray.join(","); // Convert the ids array to a string
      localStorage.setItem("name", customer_name);
      navigate(`/customer-screen/${idsString}`);
    }
  };

  const handleCustomerClick1 = (index, customer_name) => {
    // Handle the click event for the customer_name here
    const idxArray = viewContractSave?.[index]?.items?.tansaction?.id; // Get the idx array
    localStorage.setItem("name", customer_name);
    navigate(`/contract-screen/${idxArray}`);
  };

  const columns = [
    {
      label: <div className="cust">CUSTOMER</div>,
      field: "product_name",
      sort: "asc",
      width: 500,
      render: (rowData) => (
        <div
          className="clickable-customer"
          onClick={() => handleCustomerClick1()}
        >
          {rowData.customer_name}
        </div>
      ),
    },
    {
      label: "INVOICE DATE",
      field: "order_close_data",
      sort: "asc",
      width: 500,
    },
    {
      label: "INVOICE NUMBER",
      field: "invoice_number",
      sort: "asc",
      width: 500,
    },
    {
      label: "Product/Service",
      field: "billing_method",
      sort: "asc",
      width: 500,
    },
    { label: "Qty", field: "qty", sort: "asc", width: 800 },
    { label: "Sales Price", field: "sale_price", sort: "asc", width: 500 },
    { label: "Amount", field: "amount", sort: "asc", width: 500 },
    {
      label: "SUBSCRIPTION START DATE",
      field: "s_start_d",
      sort: "asc",
      width: 500,
    },
    {
      label: "SUBSCRIPTION END DATE",
      field: "s_end_d",
      sort: "asc",
      width: 500,
    },
    ...(viewContractHeading?.filter(Boolean).map((heading) => {
      const field = heading?.toLowerCase()?.replace(/[^a-z0-9]/g, "_");
      return {
        label: heading || "",
        field: field || "",
        sort: "asc",
        width: 500,
      };
    }) ?? []),
  ];

  const items = [
    "Beginning_ARR",
    "New_ARR",
    "Expansion_ARR",
    "Contraction_ARR",
    "Churn_ARR",
    "Recovery_ARR",
    "Ending_ARR",
  ];

  const items2 = [
    "Beginning_Logos",
    "New_Logos",
    "Recovery_Logos",
    "Churn_Logos",
    "Ending_Logos",
  ];

  const items3 = ["Ending_Logos", "Churn_Logos", "New_Logos"];

  const items4 = [
    "Avg_End_Arr",
    "Avg_New_Arr",
    "Arr_churn_period",
    "Arr_churn_rolling",
    "Arr_churn_12",
    "Logo_churn_period",
    "Logo_churn_rolling",
    "Logo_churn_12",
  ];

  useEffect(() => {
    if (Arrlistdata) {
      const userData = items4.map((item) => {
        const customerName = formatCustomerName(item);
        let titleValue = ""; // Initialize titleValue as an empty string

        // Add conditions to set different title values based on the item name
        if (item === "Avg_End_Arr") {
          titleValue =
            "Ending ARR in the period divided by ending logos in the period";
        } else if (item === "Avg_New_Arr") {
          titleValue =
            "New ARR in the period divided by the new logos in the period";
        } else if (item === "Arr_churn_period") {
          titleValue =
            "ARR Churn in period divided by ARR at the beginning of the period , annualized by mutiplying by the number of periods in the year";
        } else if (item === "Arr_churn_rolling") {
          titleValue =
            "ARR Churn in the last three months divided by the ARR at the beginning of the three month period , annualized by muttiplying by 4";
        } else if (item === "Arr_churn_12") {
          titleValue =
            "ARR Churn in the last 12 months divided by ARR at the beginning of the 12 month period";
        } else if (item === "Logo_churn_period") {
          titleValue =
            "Logo Churn in period divided by the logos at beginning of the period , annualized by multipying by the number of periods in the year";
        } else if (item === "Logo_churn_rolling") {
          titleValue =
            "Logo Churn in the last three months divided by logos at the beginning of the three month period , annualized by multiplying by 4";
        } else if (item === "Logo_churn_12") {
          titleValue =
            "Logo Churn in the last 12 months divided by logos at the beginning of the 12 month period";
        }

        const formattedData = {
          customer_name: <span title={titleValue}>{formatCustomer(item)}</span>,
        };

        const arrData = Arrlistdata?.Key_Metcrics[item];
        if (Array.isArray(arrData) && arrData.length > 0) {
          arrData.forEach((entry) => {
            const columnName = entry.date
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_");
            if (entry.value > 0) {
              if (item === "Avg_End_Arr" || item === "Avg_New_Arr") {
                if (entry.value > 0) {
                  formattedData[columnName] = (
                    <div className="your-h1-class">
                      {parseFloat(entry.value).toLocaleString("en-US", {
                        style: "decimal",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  );
                }
              } else {
                formattedData[columnName] = (
                  <div className="your-h1-class">{entry.value.toFixed(1)}%</div>
                );
              }
            } else {
              formattedData[columnName] = (
                <div className="your-h1-class">0</div>
              );
            }
          });
        }

        return formattedData;
      });
      setUsersForRender4(userData);
    }
  }, [Arrlistdata]);

  function formatCustomer(item) {
    // Replace underscores with spaces in the item
    const cleanedItem = item.replace(/_/g, " ");

    if (cleanedItem.startsWith("Arr") || cleanedItem.endsWith("Arr")) {
      return cleanedItem.toUpperCase(); // Convert to uppercase for items with "Arr" prefix or "Arr" suffix
    } else if (cleanedItem === "Avg End Arr" || cleanedItem === "Avg New Arr") {
      return `Avg ${cleanedItem} ARR`.toUpperCase(); // Special case for "Avg End Arr" and "Avg New Arr"
    }
    return formatCustomerName(item);
  }

  useEffect(() => {
    if (Arrlistdata) {
      const userData = items2.map((item) => {
        const formattedData = {
          customer_name: formatCustomerName(item),
        };
        const arrData = Arrlistdata?.Logo_Rollforward[item];
        if (Array.isArray(arrData) && arrData.length > 0) {
          arrData.forEach((entry) => {
            const columnName = entry.date
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_");
            const value = parseFloat(entry.value);
            const formattedValue = value.toLocaleString("en-US", {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            // Check if the value is negative, and if so, wrap it in parentheses
            formattedData[columnName] = (
              <div className="textAlign33">
                {value < 0
                  ? `(${formattedValue.replace("-", "")})`
                  : formattedValue}
              </div>
            );
          });
        }
        return formattedData;
      });
      setUsersForRender2(userData);
    }
  }, [Arrlistdata]);

  useEffect(() => {
    const titleValue = (date) => {
      let names = [];

      if (
        pendingrenewalrecord &&
        pendingrenewalrecord.data &&
        pendingrenewalrecord.data.Pending_Hover
      ) {
        for (
          let index = 0;
          index < pendingrenewalrecord.data.Pending_Hover.length;
          index++
        ) {
          const currentItem = pendingrenewalrecord.data.Pending_Hover[index];

          if (currentItem.date === date) {
            names.push(currentItem.customer_name);
          }
        }
      }

      return Array.isArray(names) ? names.join(", ") : names;
    };

    const idvalue = (date) => {
      let id1 = [];

      if (
        pendingrenewalrecord &&
        pendingrenewalrecord.data &&
        pendingrenewalrecord.data.Pending_Hover
      ) {
        for (
          let index = 0;
          index < pendingrenewalrecord.data.Pending_Hover.length;
          index++
        ) {
          const currentItem = pendingrenewalrecord.data.Pending_Hover[index];

          if (currentItem.date === date) {
            id1.push(...currentItem.ids);
          }
        }
      }

      if (id1.length > 0) {
        const idsString = id1.join(",");
        navigate(`/clientarr-screen/${idsString}`);
      }
    };

    if (pendingrenewalrecord) {
      const userData = [
        {
          customer_name: "Pending ARR",
          ...pendingrenewalrecord?.data?.Pennding_ARR.reduce(
            (acc, item, index) => {
              const fieldName = item.date
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "_");
              acc[fieldName] = (
                <div
                  className="textAlign33"
                  onClick={() => idvalue(item.date)}
                  title={titleValue(item.date)}
                >
                  {item.value != null
                    ? item.value < 0
                      ? `(${Math.round(Math.abs(item.value)).toLocaleString(
                          "en-US"
                        )})`
                      : `${Math.round(item.value).toLocaleString("en-US")}`
                    : ""}
                </div>
              );
              return acc;
            },
            {}
          ),
        },
      ];
      setUsersForRender6(userData);
    }
  }, [pendingrenewalrecord]);

  const columns3 = [
    {
      label: <div className="cust">Logo Rollforward</div>,
      field: "customer_name",
      sort: "asc",
      width: 500,
      render: (rowData) => (
        <div className="tooltip">
          <div
            className="clickable-customer"
            onClick={() => handleCustomerClick()}
            title={rowData.customer_name}
          >
            {rowData.customer_name}
          </div>
        </div>
      ),
    },
    ...(Arrlistdata?.heading?.map((heading) => ({
      label: heading,
      field: heading.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      sort: "asc",
      width: 500,
      render: (rowData) => (
        <div className="tooltip">
          <div
            className="hover-value"
            // title={rowData[heading.toLowerCase().replace(/[^a-z0-9]/g, "_")]}
          >
            {rowData[heading.toLowerCase().replace(/[^a-z0-9]/g, "_")]}
          </div>
        </div>
      ),
    })) || []),
  ];

  const data3 = {
    columns: columns3,
    rows: usersForRender2,
  };

  const handleHover = (e) => {
    const value = e.target.dataset.tip;
  };

  useEffect(() => {
    const hoverValueElements = document.getElementsByClassName("hover-value");
    for (let i = 0; i < hoverValueElements.length; i++) {
      hoverValueElements[i].addEventListener("mouseenter", handleHover);
    }
    return () => {
      for (let i = 0; i < hoverValueElements.length; i++) {
        hoverValueElements[i].removeEventListener("mouseenter", handleHover);
      }
    };
  }, []);

  const data1 = {
    columns,
    rows: usersForRender,
  };

  const csvData1 = usersForRender5?.map((rowData) => {
    const dynamicColumns = viewContractHeading
      ?.map((heading) => {
        const field = heading?.toLowerCase()?.replace(/[^a-z0-9]/g, "_");
        const value = rowData[field];
        return { [heading]: value };
      })
      .filter(
        (column) =>
          column[Object.keys(column)[0]] !== undefined &&
          column[Object.keys(column)[0]] !== null &&
          column[Object.keys(column)[0]] !== 0
      );

    const dataRow = {
      Customer: rowData.customer_name || "",
      "Invoice Date": rowData.order_close_data || "",
      "Invoice Number": rowData.invoice_number || "",
      "Product/Service": rowData.billing_method || "",
      Qty: rowData.qty || "",
      "Sales Price": rowData.sale_price || "",
      Amount: rowData.amount || "",
      "Subscription Start Date": rowData.s_start_d || "",
      "Subscription End Date": rowData.s_end_d || "",
      ...(dynamicColumns?.reduce((acc, cur) => ({ ...acc, ...cur }), {}) || {}),
    };

    return dataRow;
  });

  const [filteredData1, setFilteredData1] = useState([]);

  useEffect(() => {
    if (Arrlistdata) {
      const userData = items.map((item) => {
        const formattedData = {
          customer_name: item,
        };

        const arrData = Arrlistdata.arr_roll_fwd[item];
        if (Array.isArray(arrData) && arrData.length > 0) {
          arrData.forEach((entry) => {
            const columnName = entry.date
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_");
            formattedData[columnName] = entry.value.toFixed(2);
          });
        }
        return formattedData;
      });

      setFilteredData1(userData);
    }
  }, [Arrlistdata]);
  const [hoveredValue, setHoveredValue] = useState("");
  const [hoveredValue1, setHoveredValue1] = useState([
    { customer_name: "Customer 1", value: 100, id: "" },
  ]);
  const [hoveredIndex, sethoveredindex] = useState("");
  const [showName, setShowName] = useState("");

  // const handleChange = () => {};
  const items1 = [
    "Expansion_ARR",
    "New_ARR",
    "Churn_ARR",
    "Contraction_ARR",
    "Ending_ARR",
  ];

  const [selectedItems, setSelectedItems] = useState(items1);
  const [selectedColors, setSelectedColors] = useState(items1);
  const [yValues, setYValues] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const arrRollFwd = Arrlistdata?.arr_roll_fwd || {};

      const selectedValues = selectedItems.map((item) => {
        if (arrRollFwd[item]) {
          return arrRollFwd[item].map((data) => ({
            label: data.date,
            y: data.value,
          }));
        }
        return [];
      });
      setYValues(selectedValues);
    };

    fetchData();
  }, [selectedItems, Arrlistdata]);

  const handleColorClick = (itemName) => {
    let updatedSelectedItems;
    let updatedSelectedColors;
    if (selectedItems.includes(itemName)) {
      updatedSelectedItems = selectedItems.filter((item) => item !== itemName);
      updatedSelectedColors = selectedColors.filter(
        (color) => color !== itemName
      );
    } else {
      updatedSelectedItems = [...selectedItems, itemName];
      updatedSelectedColors = [...selectedColors, itemName];
    }

    setSelectedItems(updatedSelectedItems);
    setSelectedColors(updatedSelectedColors);
  };

  const getColorForItem = (item) => {
    const itemIndex = items1.indexOf(item);
    const colors = ["green", "#90EE90", "red", "#c7c700", "black"];
    return colors[itemIndex % colors.length];
  };

  const options = {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light2",
    title: {
      text: "",
    },
    axisY: {
      includeZero: true,
    },
    data: selectedItems.length === 0 ? getStaticData() : getChartData(),
  };

  function getStaticData() {
    const headings = Arrlistdata?.heading || [];

    // Provide static data when no items are selected
    const staticData = [
      {
        type: "stackedColumn",
        axisYType: "primary", // Display on the left side
        dataPoints: headings.map((headingItem) => ({
          label: headingItem,
        })),
      },
      {
        type: "stackedColumn",
        axisYType: "secondary", // Display on the right side
        dataPoints: headings.map((headingItem) => ({
          label: headingItem,
        })),
      },
    ];

    return staticData;
  }

  function getChartData() {
    // Generate chart data based on selectedItems as you did before
    return selectedItems.map((item, index) => {
      const dataPoints = Arrlistdata?.heading?.map((headingItem) => {
        const matchingData = yValues[index]?.find(
          (data) => data.label === headingItem
        );
        return {
          label: headingItem,
          y: matchingData ? matchingData.y : 0,
          color: getColorForItem(item),
        };
      });

      const lineColor = item === "Ending_ARR" ? "black" : getColorForItem(item);
      const yAxisType = item === "Ending_ARR" ? "primary" : "secondary";
      const type = item === "Ending_ARR" ? "line" : "stackedColumn";

      if (
        dataPoints &&
        dataPoints.length > 0 &&
        dataPoints.some((dataPoint) => dataPoint.y !== 0)
      ) {
        return {
          type: type,
          indexLabelFontColor: "#5A5757",
          indexLabelPlacement: "outside",
          dataPoints,
          lineDashType: "solid",
          lineColor: lineColor,
          markerType: "circle",
          markerSize: 6,
          markerColor: lineColor,
          toolTipContent: "{label}: {y}",
          xValueFormatString: "MMM YYYY",
          interval: 3,
          intervalType: "month",
          axisYType: yAxisType,
        };
      }
      return [];
    });
  }

  // Create your chart using CanvasJS with the 'options' object

  // Create your chart using CanvasJS with the 'options' object

  // Create your chart using CanvasJS with the 'options' object

  // Create your chart using CanvasJS with the 'options' object

  // Create your chart using CanvasJS with the 'options' object

  // Create your chart using CanvasJS with the 'options' object

  const [selectedItems1, setSelectedItems1] = useState(items3);
  const [selectedColors1, setSelectedColors1] = useState(items3);
  const [yValues1, setYValues1] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      const arrRollFwd = Arrlistdata?.Logo_Rollforward || {};

      const selectedValues = selectedItems1.map((item) => {
        if (arrRollFwd[item]) {
          return arrRollFwd[item].map((data) => ({
            label: data.date,
            y: data.value,
          }));
        }
        return [];
      });

      setYValues1(selectedValues);
    };

    fetchData();
  }, [selectedItems1, Arrlistdata]);

  const handleColorClick1 = (itemName) => {
    let updatedSelectedItems;
    let updatedSelectedColors;
    if (selectedItems1.includes(itemName)) {
      updatedSelectedItems = selectedItems1.filter((item) => item !== itemName);
      updatedSelectedColors = selectedColors1.filter(
        (color) => color !== itemName
      );
    } else {
      updatedSelectedItems = [...selectedItems1, itemName];
      updatedSelectedColors = [...selectedColors1, itemName];
    }

    setSelectedItems1(updatedSelectedItems);
    setSelectedColors1(updatedSelectedColors);
  };

  const getColorForItem1 = (item) => {
    const itemIndex = items3.indexOf(item);
    const colors = ["black", "red", "green"];
    return colors[itemIndex % colors.length];
  };

  const options1 = {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light2",
    title: {
      text: "",
    },
    axisY: {
      includeZero: true,
    },
    data: selectedItems1.length === 0 ? getStaticData1() : getChartData1(),
  };

  function getStaticData1() {
    const headings = Arrlistdata?.heading || [];

    // Provide static data when no items are selected
    const staticData = [
      {
        type: "stackedColumn",
        axisYType: "primary", // Display on the left side
        dataPoints: headings.map((headingItem) => ({
          label: headingItem,
        })),
      },
      {
        type: "stackedColumn",
        axisYType: "secondary", // Display on the right side
        dataPoints: headings.map((headingItem) => ({
          label: headingItem,
        })),
      },
    ];

    return staticData;
  }

  function getChartData1() {
    // Generate chart data based on selectedItems as you did before
    return selectedItems1.map((item, index) => {
      const dataPoints = Arrlistdata?.heading?.map((headingItem) => {
        const matchingData = yValues1[index]?.find(
          (data) => data.label === headingItem
        );
        return {
          label: headingItem,
          y: matchingData ? matchingData.y : 0,
          color: getColorForItem1(item),
        };
      });

      const lineColor =
        item === "Ending_Logos" ? "black" : getColorForItem(item);
      const yAxisType = item === "Ending_Logos" ? "primary" : "secondary";
      const type = item === "Ending_Logos" ? "line" : "stackedColumn";
      if (
        dataPoints &&
        dataPoints.length > 0 &&
        dataPoints.some((dataPoint) => dataPoint.y !== 0)
      ) {
        return {
          type: type,
          indexLabelFontColor: "#5A5757",
          indexLabelPlacement: "outside",
          dataPoints,
          lineDashType: "solid",
          lineColor: lineColor,
          markerType: "circle",
          markerSize: 6,
          markerColor: lineColor,
          toolTipContent: "{label}: {y}",
          xValueFormatString: "MMM YYYY",
          interval: 3,
          intervalType: "month",
          axisYType: yAxisType,
        };
      }
      return [];
    });
  }

  const { Clientarrsearchrecord, success: searcharrrecord } = useSelector(
    (state) => state.ArrClientsearch
  );
  const handleSearch = (value) => {
    // if (value) {
    dispatch(
      ClientaRRsearchtrquest(startPeriod, endPeriod, selectedOption, value)
    );

  };

  const [timerId, setTimerId] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear the existing timer
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set a new timer to call handleSearch after 500 milliseconds
    const newTimerId = setTimeout(() => {
      handleSearch(value);
    }, 500);

    // Save the timer ID for cleanup
    setTimerId(newTimerId);
  };

  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  const handleSearchdb = (value) => {
    dispatch(
      Clientsearchtrquest(
        revinueList,
        startPeriod,
        endPeriod,
        selectedOption,
        value
      )
    );
  };

  const { Clientsearchrecord, success: searchrecord } = useSelector(
    (state) => state.Clientsearch
  );

  useEffect(() => {
    if (searchrecord) {
      setViewContractSave(Clientsearchrecord?.data);
    }
  }, [searchrecord]);

  useEffect(() => {
    if (searcharrrecord) {
      setFilteredData(Clientarrsearchrecord?.data);
    }
  }, [searcharrrecord]);

  useEffect(() => {
    if (atoZfilter || revinueList) {
      setFilteredData([]);
    }
  }, [atoZfilter, revinueList]);

  const [timerId1, setTimerId1] = useState(null);

  const contractdbinput = (e) => {
    const value = e.target.value;
    setsearchdb(value);
    if (timerId1) {
      clearTimeout(timerId1);
    }
    const newTimerId = setTimeout(() => {
      handleSearchdb(value);
    }, 500);

    // Save the timer ID for cleanup
    setTimerId1(newTimerId);
  };

  useEffect(() => {
    return () => {
      if (timerId1) {
        clearTimeout(timerId1);
      }
    };
  }, [timerId1]);

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  if (!filteredData) {
    return null; // Return null or a loading indicator while the data is being fetched
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const itemsPerPage1 = 5;

  const handleCustomerClick2 = () => {
    // Handle customer click event here
  };

  const handleSearch1 = (e) => {
    const value = e.target.value;
    setSearchQuery1(value);
    setCurrentPage1(1);
  };
  const maxDisplayedPages = 8;

  const renderPaginationItems = () => {
    const pageItems = [];
    const lowerLimit = Math.max(
      1,
      currentPage - Math.floor(maxDisplayedPages / 2)
    );
    const upperLimit = Math.min(totalPages, lowerLimit + maxDisplayedPages - 1);

    for (let page = lowerLimit; page <= upperLimit; page++) {
      pageItems.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    return pageItems;
  };

  const handlePageChange1 = (page) => {
    setCurrentPage1(page);
  };

  const startIndex1 = (currentPage1 - 1) * itemsPerPage1;
  const endIndex1 = startIndex1 + itemsPerPage1;

  const filteredItems = filteredData1.filter((rowData) =>
    rowData.customer_name.toLowerCase().includes(searchQuery1.toLowerCase())
  );


  const filteredItemsTotal = filteredItems.filter(
    (rowData) => rowData.customer_name == "Ending_ARR"
  );

  const currentItems1 = filteredItems.slice(startIndex1, endIndex1);
  const totalPages1 = Math.ceil(filteredItems.length / itemsPerPage1);

  const handleMouseOver = (value, index, name, date) => {
    let name1 = "";
    let name3 = "";
    if (name === "Beginning_ARR") {
      name1 = "";
      name3 = "Beginning_ARR";
    } else if (name === "New_ARR") {
      name1 = "new_hover";
      name3 = "New_ARR";
    } else if (name === "Expansion_ARR") {
      name1 = "expansion_hover";
      name3 = "Expansion_ARR";
    } else if (name === "Contraction_ARR") {
      name1 = "contraction_hover";
      name3 = "Contraction_ARR";
    } else if (name === "Churn_ARR") {
      name1 = "churn_hover";
      name3 = "Churn_ARR";
    } else if (name === "Recovery_ARR") {
      name1 = "recovery_hover";
      name3 = "Recovery_ARR";
    } else if (name === "Ending_ARR") {
      name1 = "";
      name3 = "Ending_ARR";
    }

    const arrData = Arrlistdata?.arr_roll_fwd[name1];
    const filteredData = arrData?.filter((entry) => entry.date === date);

    const hoveredValues1 = filteredData?.map((entry) => ({
      customer_name: entry.customer_name,
      value: entry.value.toFixed(2),
      id: entry.ids,
    }));

    setHoveredValue1(hoveredValues1);
    // Display the hovered value in a div
    setHoveredValue(value);
    sethoveredindex(index);
    setShowName(name3);
  };

  const handleMouseOut = () => {
    setHoveredValue("");
    sethoveredindex("");
  };

  const navigateclick = () => {
    const allIds = hoveredValue1?.flatMap((item) => item.id);
    if (allIds) {
      const idsString = allIds.join(",");
      navigate(`/clientarr-screen/${idsString}`);
    }
  };

  const handlesubmit = async () => {
    try {
      // First API call
      await dispatch(cachecleaner());

      // Second API call
      await dispatch(
        ViewContractDbAction(
          revinueList,
          startPeriod,
          endPeriod,
          selectedOption,
          pageNumShow
        )
      );

      // Third API call
      await dispatch(
        Invoicelistrequest(startPeriod, endPeriod, selectedOption, pageNumShow1,company_id)
      );

      // Fourth API call
      await dispatch(InvoicelistrequestCSV(selectedOption));

      // Fifth API call
      await dispatch(Arrlist(startPeriod, endPeriod, selectedOption));

      // All API calls have completed successfully
    } catch (error) {
      // Handle any errors that occur during the API calls
      console.error("Error during API calls:", error);
    }
  };

  const handlecache = () => {
    dispatch(cachecleaner());
    swal({
      title: "Success",
      text: "Cache Cleared.",
      // icon: "/logoicon_new.png",
      buttons: false,
      timer: 5000,
    });
    dispatch(Arrlist(startPeriod, endPeriod, selectedOption));
  };

  const csvHeaders = ["Customer Name", ...(InvoicelistCsv?.heading ?? [])];

  const csvData = InvoicelistCsv?.data?.map((item) => {
    const rowData = [
      item?.customer_name,
      ...(InvoicelistCsv?.heading ?? []).map((heading) => {
        const columnName = heading.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const revenue = item?.arr?.find(
          (rev) =>
            rev.date.toLowerCase().replace(/[^a-z0-9]/g, "_") === columnName
        );
        const value = revenue ? revenue.value.toFixed(2) : "0";
        return value;
      }),
    ];
    return rowData;
  });
  const createWorkbook = () => {
    const worksheet = createWorksheet();
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
    return workbook;
  };

  const createWorksheet = () => {
    const worksheetData = [
      [revinueList.toUpperCase()], // Add the content of revinueList in cell A1 (capitalized)
      Object.keys(csvData1[0]),
      ...csvData1.map(Object.values),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Apply bold style to cell A1
    const boldStyle = { font: { bold: true } };
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
    worksheet[cellRef].s = boldStyle;

    return worksheet;
  };

  const saveWorkbook = (workbook, filename) => {
    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  };

  const handleDownloadExcel = () => {
    const workbook = createWorkbook();
    saveWorkbook(workbook, "data.xlsx");
  };

  // ----------------------------for above table----------------------------------

  const createWorkbook1 = () => {
    const worksheet = createWorksheet1();
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
    return workbook;
  };

  const createWorksheet1 = () => {
    const worksheetData = [
      Object.keys(csvData[0]),
      ...csvData.map(Object.values),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    return worksheet;
  };

  const saveWorkbook1 = (workbook, filename) => {
    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  };

  const handleDownloadExcel1 = () => {
    const workbook = createWorkbook1();
    saveWorkbook1(workbook, "data.xlsx");
  };

  const columns4 = [
    {
      label: <div className="cust">Key Metrics</div>,
      field: "customer_name", // Just the field name without formatting
      sort: "asc",
      width: 500,
      render: (rowData) => (
        <div className="tooltip">
          <div
            className="clickable-customer"
            onClick={() => handleCustomerClick()}
            title={rowData.customer_name}
          >
            {rowData.customer_name}
          </div>
        </div>
      ),
    },
    ...(Arrlistdata?.heading?.map((heading) => ({
      label: heading,
      field: heading.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      sort: "asc",
      width: 500,
      render: (rowData) => (
        <div className="tooltip">
          <div
            className="hover-value"
            // title={rowData[heading.toLowerCase().replace(/[^a-z0-9]/g, "_")]}
          >
            {rowData[heading.toLowerCase().replace(/[^a-z0-9]/g, "_")]}
          </div>
        </div>
      ),
    })) || []),
  ];

  const data4 = {
    columns: columns4,
    rows: usersForRender4,
  };

  const columns5 = [
    {
      label: <div className="cust">Pending ARR</div>,
      field: "customer_name",
      sort: "asc",
      width: 500,
    },
    ...(pendingrenewalrecord?.heading || []).map((item) => ({
      label: item,
      field: item.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      sort: "asc",
      width: 500,
    })),
  ];

  const data5 = {
    columns: columns5,
    rows: usersForRender6,
  };

  // new

  const handleClickAToZ = (dataShow) => {
    setAtoZFilter(dataShow);
  };

  return (
    <div>
      {" "}
      <div className="CustomerbyMonthtable">
        <div className="Contract-Database-List-main">
          <Link to="">
            <h1 className="Contract-Database-List-text">
              ARR by Customer by Month
            </h1>
          </Link>
        </div>
        <div
          className="table-responsive1414114"
          style={{ display: "flex", marginBottom: "10px" }}
        >
          <input
            type="text"
            className="Search-by-customer-name"
            placeholder="Search by customer name"
            value={searchQuery}
            onChange={handleInputChange}
          />

          {!csv2 && (
            <>
              {" "}
              <button className="csvbuttonshow" onClick={() => download_csv()}>
                CSV{" "}
              </button>
            </>
          )}
          {csv2 && (
            <>
              {" "}
              <div className="button_main">
                <span>CSV Downloading</span>

                <div class="loader ms-2">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
            </>
          )}
          {!excel2 && (
            <>
              {" "}
              <button
                className="csvbuttonshow"
                onClick={() => download_excel()}
              >
                Excel
              </button>
            </>
          )}
          {excel2 && (
            <>
              <div className="button_main">
                <span>Excel Downloading</span>

                <div class="loader ms-2">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
            </>
          )}

          {/* <button
                  className="csvbuttonfordownloadExcel"
                  onClick={handleExcelDownload}
                >
                  Excel
                </button> */}

          {/* <button className="csvbuttonfordownloadExcel" onClick={() => handleExcelDownload(InvoicelistCsv)}>Download Excel</button> */}
          {csvData && csvHeaders && (
            <>
              <button
                className="csvbuttonfordownloadExcel"
                onClick={handleDownloadExcel1}
              >
                Excel
              </button>
            </>
          )}
        </div>
        <div className="content Customerdiv">
          <div className="container-fluid table_1_Last">
            <div
              className="table_res_newsecLast newcontactadd"
              onScroll={sechandleScroll}
              ref={seccontainerRef}
            >
              <table className="table-responsive ">
                <thead>
                  <tr>
                    <th className="news_customer">
                      <div className="filtersectionShow">
                        ARR by Customer by Month
                        <span className="filtersectionShowSpan">
                          <i
                            class="fa fa-sort-asc"
                            onClick={() => handleClickAToZ("customer_name")}
                          ></i>

                          <i
                            class="fa fa-sort-desc"
                            onClick={() => handleClickAToZ("-customer_name")}
                          ></i>
                        </span>
                      </div>
                    </th>
                    {invoicelistHeading?.map((heading, headingIndex) => (
                      <th key={headingIndex}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>
                        <div
                          className="viewcontractdiv1t"
                          style={{ display: "flex" }}
                        >
                          <div style={{ display: "flex" }}>
                            <p
                              className="editiconDeletenew"
                              onClick={() =>
                                handleCustomerClick(
                                  rowIndex,
                                  item?.customer_name
                                )
                              }
                            >
                              {formatCustomerName(item.customer_name)}
                            </p>
                          </div>
                        </div>
                      </td>
                      {invoicelistHeading?.map((heading, headingIndex) => {
                        const columnName = heading
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "_");
                        const revenue = item?.arr?.find(
                          (rev) =>
                            rev.date
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, "_") === columnName
                        );

                        // Update value formatting to display negative values within parentheses
                        let value = "0"; // Default value
                        if (revenue) {
                          const numericValue = parseFloat(revenue.value);
                          if (!isNaN(numericValue)) {
                            value = numericValue.toLocaleString("en-US", {
                              style: "decimal",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            });

                            // Check if the value is negative, and if so, wrap it in parentheses
                            if (numericValue < 0) {
                              value = `(${value.replace("-", "")})`;
                            }
                          }
                        }

                        const update = revenue ? revenue.pending_arr : false;
                        const statusCol = revenue ? revenue.status : "black";

                        const cellStyle = {
                          backgroundColor:
                            update === true
                              ? "yellow"
                              : update === false && statusCol === "red"
                              ? "red"
                              : update === false && statusCol === "green"
                              ? "green"
                              : "inherit",
                          position: "relative",
                        };

                        return (
                          // <td key={headingIndex} style={cellStyle}>
                          //   {value}
                          // </td>
                          <td key={headingIndex} style={cellStyle}>
                            <div className="textAlign33">{value}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* {pageNumShow < pageSize && (
                  <div className="loadingsctionForLastTable">
                    <p className="loadingParagraph">Loading.....</p>
                  </div>
                )} */}
                </tbody>
                <tfoot className="lastTableTfoot">
                  {/* {filteredData.length > 0 &&
              Invoicelist?.heading?.length > 0 ? (
                <tr className="totalRow">
                  <td>Total</td>
                  {Invoicelist?.heading?.map(
                    (heading, headingIndex) => {
                      const columnName = heading
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, "_");
                      const totalForColumn = getCotTatal?.total?.find(
                        (total) =>
                          total.date
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, "_") === columnName
                      );
                      const totalValue = totalForColumn
                        ? totalForColumn.value.toLocaleString("en-US", {
                            style: "decimal",
                            // minimumFractionDigits: 0,
                            // maximumFractionDigits: 0,
                          })
                        : 0;

                      return <td key={headingIndex}>${totalValue}</td>;
                    }
                  )}
                </tr>
              ) : null} */}

                  {filteredItemsTotal.map((rowData, rowIndex) => (
                    <tr className="totalRow" key={rowIndex}>
                      <td
                        className={
                          rowData.customer_name === "Ending_ARR" &&
                          "headingBold1"
                        }
                      >
                        {/* {formatCustomerName(rowData.customer_name)} */}
                        Total
                      </td>

                      {Arrlistdata?.heading?.map((heading, index) => (
                        <td
                          key={index}
                          className={
                            rowData.customer_name === "Ending_ARR" &&
                            "heading3843"
                          }
                        >
                          <div
                            onMouseOver={() =>
                              handleMouseOver(
                                rowData[
                                  heading
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, "_")
                                ],
                                index,
                                rowData.customer_name,
                                heading
                              )
                            }
                            onMouseOut={() => handleMouseOut()}
                            onClick={() => navigateclick()}
                            className="hover-value"
                          >
                            {rowData[
                              heading.toLowerCase().replace(/[^a-z0-9]/g, "_")
                            ] != null
                              ? rowData[
                                  heading
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, "_")
                                ] < 0
                                ? `(${Math.round(
                                    Math.abs(
                                      rowData[
                                        heading
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]/g, "_")
                                      ]
                                    )
                                  ).toLocaleString("en-US")})`
                                : `${Math.round(
                                    rowData[
                                      heading
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]/g, "_")
                                    ]
                                  ).toLocaleString("en-US")}`
                              : ""}

                            {hoveredValue ===
                              rowData[
                                heading.toLowerCase().replace(/[^a-z0-9]/g, "_")
                              ] &&
                              hoveredIndex === index &&
                              showName == rowData.customer_name && (
                                <>
                                  <div className="backgroundsec">
                                    {hoveredValue1?.map((item) => (
                                      <React.Fragment key={item.customer_name}>
                                        <div className="viewcontextnew">
                                          <div className="hoverClass">
                                            <h1>{item.customer_name}</h1>
                                            <h1>{item.value}</h1>
                                          </div>
                                        </div>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </>
                              )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tfoot>
              </table>
            </div>
            {secTableLoader && (
              <div className="Sectableloadersection">
                <SpinnerLoading />
              </div>
            )}
          </div>
          {/* <div className="Customertext1">
            <p>
              {" "}
              <div className="filtersectionShow">
                ARR by Customer by Month
               
              </div>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CustomerByMonth;
