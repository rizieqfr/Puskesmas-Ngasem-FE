import MetaHead from '@/components/MetaHead';
import Modal from '@/components/Modal';
import ModalDelete from '@/components/ModalDelete';
import Navbar from '@/components/Navbar';
import Table from '@/components/Table';
import TablePagination from '@/components/TablePagination';
import useFetchData from '@/hooks/useFetchData';
import ClientRequest from '@/utils/clientApiService';
import { withSession } from '@/utils/sessionWrapper';
import axios from 'axios';
import { useFormik } from 'formik';
import { toNumber } from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BiSolidPencil } from 'react-icons/bi';
import { FaTrashAlt } from 'react-icons/fa';
import { IoEye } from 'react-icons/io5';

export default function AnalisisRekamMedis({ user }) {
  const {
    data: dataAnalisisRekamMedis,
    pagination: paginationAnalisisRekamMedis,
    fetchData: fetchDataAnalisisRekamMedis,
    setSearch: setSearchAnalisisRekamMedis,
    debouncedFetchData: debouncedFetchDataAnalisisRekamMedis,
  } = useFetchData('/api/analisis-rekam-medis/get');
  const {
    data: rawDataRekamMedisLengkap,
    pagination: paginationRekamMedisLengkap,
    fetchData: fetchDataRekamMedisLengkap,
    setSearch: setSearchRekamMedisLengkap,
    debouncedFetchData: debouncedFetchDataRekamMedisLengkap,
  } = useFetchData('/api/rekam-medis/get');

  const dataRekamMedisLengkap = (rawDataRekamMedisLengkap ?? []).filter((item) => {
  return Object.entries(item).every(([key, value]) => {
    // Mengabaikan pengecekan untuk field eTTd
    if (key === 'eTTd') return true;
    
    // Cek nilai untuk field lainnya
    return value !== null && value !== undefined && value !== '' && value !== 'null';
  });
});

  const kolomAnalisisRekamMedis = [
    {
      header: 'No.',
      cell: (row) => (
        <h1>
          {toNumber(row.row.index) +
            1 +
            (paginationAnalisisRekamMedis.currentPage - 1) *
              paginationAnalisisRekamMedis.dataPerpages}
          .
        </h1>
      ),
    },
    {
      header: 'Tanggal Kunjungan',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <p>{moment(row.original.tanggalKunjungan).format('DD-MM-YYYY')}</p>
      ),
    },
    { header: 'Nama Pasien', accessorKey: 'Pasiens.namaLengkap' },
    { header: 'Keluhan', accessorKey: 'subjektif' },
    {
      header: 'Aksi',
      cell: ({ row }) => (
        <>
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => router.push(`/rekam-medis?id=${row.original.id}`)}
              className="text-sm font-semibold text-[#072B2E] hover:font-semibold hover:underline hover:text-blue-500"
            >
              Lengkapi Rekam Medis
            </button>
          </div>
        </>
      ),
    },
  ];
    const kolomRekamMedisLengkap = [
      {
        header: 'No.',
        cell: (row) => (
          <h1>
            {toNumber(row.row.index) +
              1 +
              (paginationRekamMedisLengkap.currentPage - 1) *
                paginationRekamMedisLengkap.dataPerpages}
            .
          </h1>
        ),
      },
      {
        header: 'Tanggal Kunjungan',
        accessorKey: 'tanggalKunjungan',
        cell: ({ row }) => (
          <p>{moment(row.original.tanggalKunjungan).format('DD-MM-YYYY')}</p>
        ),
      },
    { header: 'Nama Pasien', accessorKey: 'namaPasien' },
      { header: 'Keluhan', accessorKey: 'subjektif' },
      { header: 'Diagnosa Penyakit', accessorKey: 'diagnosaPenyakit' },
      {
        header: 'Catatan Keperawatan',
        accessorKey: 'catatanKeperewatan',
      },
      {
        header: 'Aksi',
        cell: ({ row }) => (
          <>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => router.push(`/rekam-medis/${row.original.id}`)}
                className="text-xl text-[#072B2E]"
              >
                <IoEye />
              </button>
            </div>
          </>
        ),
      },
    ];

  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalDetail, setShowModalDetail] = useState(false);
  const [idPasien, setIdPasien] = useState('');
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();
  const deleteAnalisisRekamMedis = async () => {
    try {
      await toast.promise(axios.delete(`/api/patient/delete?id=${idPasien}`), {
        loading: 'Processing...',
        success: (res) => {
          setShowModalDelete(!showModalDelete);
          setRefresh((prev) => !prev);
          return res.response?.data?.message || 'Berhasil Menghapus Pasien';
        },
        error: (err) => {
          return err.response?.data?.error || 'Something went wrong';
        },
      });
    } catch (error) {}
  };

  useEffect(() => {
    fetchDataAnalisisRekamMedis();
    fetchDataRekamMedisLengkap(); 
  }, [refresh]);

  return (
    <div>
      <MetaHead title={'Analisis Rekam Medis | Puskesmas Ngasem'} />
      <ModalDelete
        activeModal={showModalDelete}
        buttonClose={() => setShowModalDelete(!showModalDelete)}
        submitButton={deleteAnalisisRekamMedis}
      />

      <Navbar
        tittlePage={'Analisis Rekam Medis'}
        subTittlePage={'Daftar Rekam Medis yang Belum Lengkap'}
      />
      <div className="mb-10">
        <TablePagination
          data={dataAnalisisRekamMedis}
          columns={kolomAnalisisRekamMedis}
          fetchData={fetchDataAnalisisRekamMedis}
          pagination={paginationAnalisisRekamMedis}
          setSearch={setSearchAnalisisRekamMedis}
          debouncedFetchData={debouncedFetchDataAnalisisRekamMedis}
          showSearchBar={true}
        />
      </div>
      <div className='border-t-2 border-slate-600 pt-4'>
          <h1 className="text-3xl font-bold text-blue-700 md:mb-0 mb-3">
            Rekam Medis
          </h1>
          <h2 className="text-xl font-semibold text-slate-500">
            Daftar Rekam Medis yang Telah Lengkap
          </h2>
          <div>
            <TablePagination
            data={dataRekamMedisLengkap}
            columns={kolomRekamMedisLengkap}
            fetchData={fetchDataRekamMedisLengkap}
            pagination={paginationRekamMedisLengkap}
            setSearch={setSearchRekamMedisLengkap}
            debouncedFetchData={debouncedFetchDataRekamMedisLengkap}
            showSearchBar={true}
            />
          </div>
      </div>
    </div>
  );
}

export const getServerSideProps = withSession(async ({ req }) => {
  const accessToken = req.session?.auth?.access_token;
  const user = req.session?.user || [];
  const isLoggedIn = !!accessToken;
  if (!isLoggedIn) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  // let dataProvinsi = [];
  // let dataProfile = [];

  // try {
  //   const res = await ClientRequest.GetProvince(accessToken, "", 10000, 1);
  //   dataProvinsi = res.data.data || [];
  // } catch (error) {
  //   console.error("Error fetching province data");
  // }

  // try {
  //   const res = await ClientRequest.GetProfile(accessToken);
  //   dataProfile = res.data || [];
  // } catch (error) {
  //   console.error("Error fetching province data");
  // }

  return {
    props: {
      user,
      // listProvinsi: dataProvinsi || [],
      // listProfile: dataProfile || [],
    },
  };
});
